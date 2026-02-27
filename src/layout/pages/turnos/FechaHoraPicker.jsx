import { useEffect, useMemo, useState } from "react";
import { styled } from "@mui/material";
import Grid from '@mui/material/Grid';
import {
    LocalizationProvider,
    PickersDay,
    renderTimeViewClock,
    StaticDatePicker,
    StaticTimePicker
} from "@mui/x-date-pickers";
import { esES } from '@mui/x-date-pickers/locales';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Typography from "@mui/material/Typography";
import { DATE_FORMAT, TIME_FORMAT } from "../../libs/constants";

export const FechaHoraPicker = ({ turno, fecha, medicoHor, horarioSemanal, highlightedDays, horasConTurno, timeError, setTimeError, onChangeDate, onChangeTime }) => {
    const hoy = dayjs();
    
    const [medicoHorario, setMedicoHorario] = useState({
        minTime: null,
        maxTime: null,
    });

    // Sincronizar el horario permitido según el día seleccionado
    useEffect(() => {
        const dte = dayjs(turno.fecha.dato || fecha);
        if (dte.isValid() && horarioSemanal.length > 0) {
            const diaSemana = dte.day() === 0 ? 7 : dte.day();
            const diaAtencion = horarioSemanal.find(d => d.diaSemana === diaSemana);

            if (diaAtencion?.hora_atencion_inicio && diaAtencion?.hora_atencion_fin) {
                setMedicoHorario({
                    minTime: dayjs(diaAtencion.hora_atencion_inicio, 'HH:mm:ss'),
                    maxTime: dayjs(diaAtencion.hora_atencion_fin, 'HH:mm:ss'),
                });
            } else {
                setMedicoHorario({ minTime: null, maxTime: null });
            }
        }
    }, [horarioSemanal, turno.fecha.dato, fecha]);

    const disableThisDay = (date) => {
        const diaSemana = date.day() === 0 ? 7 : date.day();
        const dia = horarioSemanal.find(d => d.diaSemana === diaSemana);
        return !dia || dia.hora_atencion_inicio === null;
    };

    const disableThisTimes = (timeValue) => {
        if (!medicoHorario.minTime || !medicoHorario.maxTime) return true;
        const horaStr = timeValue.format(TIME_FORMAT);
        return horasConTurno?.includes(horaStr) ?? false;
    };

    const HighlightedDay = styled(PickersDay, {
        shouldForwardProp: (prop) => prop !== 'isActuallySelected',
    })(({ theme, isActuallySelected }) => ({
        ...(isActuallySelected && {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': { backgroundColor: theme.palette.primary.dark },
        }),
        "&.Mui-selected": {
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
        },
    }));

    const renderDay = (props) => {
        const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;
        const dateStr = day.format(DATE_FORMAT);
        const isHighlighted = !outsideCurrentMonth && highlightedDays.includes(dateStr);
        const isActuallySelected = !outsideCurrentMonth && dateStr === dayjs(turno.fecha.dato).format(DATE_FORMAT);

        return (
            <HighlightedDay
                {...other}
                day={day}
                outsideCurrentMonth={outsideCurrentMonth}
                selected={isHighlighted}
                isActuallySelected={isActuallySelected}
            />
        );
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <StaticDatePicker
                        displayStaticWrapperAs="desktop"
                        value={dayjs(turno.fecha.dato)}
                        onChange={onChangeDate}
                        maxDate={hoy.add(2, "month")}
                        slots={{ day: renderDay }}
                        slotProps={{
                            day: { highlightedDays },
                            actionBar: { actions: ['today'] },
                        }}
                        shouldDisableDate={disableThisDay}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <StaticTimePicker
                        disabled={!medicoHorario.minTime}
                        value={turno.hora.dato ? dayjs(turno.hora.dato) : null}
                        onChange={(time) => onChangeTime(time, 'hora')}
                        viewRenderers={{ hours: renderTimeViewClock }}
                        views={['hours']}
                        ampm={false}
                        shouldDisableTime={disableThisTimes}
                        minTime={medicoHorario.minTime}
                        maxTime={medicoHorario.maxTime}
                        slotProps={{
                            actionBar: { actions: ['clear'] },
                        }}
                    />
                    {turno.hora.error && (
                        <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                            Horario no disponible o fuera de rango.
                        </Typography>
                    )}
                </Grid>
            </Grid>
        </LocalizationProvider>
    );
};