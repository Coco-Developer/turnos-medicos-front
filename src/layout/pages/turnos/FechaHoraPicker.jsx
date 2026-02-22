import {useEffect, useMemo, useState} from "react";
import {styled} from "@mui/material";
import Grid from '@mui/material/Grid';
import {
    LocalizationProvider,
    PickersDay,
    renderTimeViewClock,
    StaticDatePicker,
    StaticTimePicker
} from "@mui/x-date-pickers";
import { esES } from '@mui/x-date-pickers/locales';
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Typography from "@mui/material/Typography";
import {DATE_FORMAT, TIME_FORMAT} from "../../libs/constants";

//------------------------------------------------------------------------------
export const FechaHoraPicker = ({ turno, fecha, medicoHor, horarioSemanal, highlightedDays, horasConTurno, timeError, setTimeError, onChangeDate, onChangeTime }) => {
    const hoy = dayjs();
    turno.fecha.dato = turno.fecha.dato ?? fecha;

    const [medicoHorario, setMedicoHorario] = useState({
        minTime: medicoHor.minTime,
        maxTime: medicoHor.maxTime,
    });
    //--------------------------------------------------------------------------
    const disableThisDay = (date) => {
        // day() devuelve: 0=Dom, por eso se lo transforma en 7
        const diaSemana = date.day() === 0 ? 7 : date.day();
        const dia = horarioSemanal.find(d => d.diaSemana === diaSemana);
        // Se pregunta solo por el inicio, ya que, si es null, debería ser null
        // también el fin (según las reglas aplicadas a las altas y
        // modificaciones de Médico).
        return dia && dia.hora_atencion_inicio === null;
    }
    //--------------------------------------------------------------------------
    const disableThisTimes = (timeValue, clockType) => {
        //console.info('Deshabilitar estas horas');
        // const hora = dayjs(timeValue).format('HH:mm:ss');
        //
        // if (!(horasConTurno === undefined)){
        //     return horasConTurno.includes(hora);
        // }
        // return false;

        // Si el médico no trabaja este día → deshabilitar todas las horas
        if (medicoHorario.minTime === null || medicoHorario.maxTime === null) {
            return true;
        }

        const hora = dayjs(timeValue).format(TIME_FORMAT);
        return horasConTurno?.includes(hora) ?? false;
    }
    //------------------------------------------------------------------------------
    // Basado en https://stackoverflow.com/a/76578587
    const HighlightedDay = styled(PickersDay, {
        shouldForwardProp: (prop) => prop !== 'isActuallySelected', })
    (({ theme, isActuallySelected }) => ({
        ...(isActuallySelected && {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
                backgroundColor: theme.palette.primary.dark,
            },
            '&:focus': {
                backgroundColor: theme.palette.primary.dark,
            },
        }),
        "&.Mui-selected": {
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
        },
    }));
    //--------------------------------------------------------------------------
    // Basado en https://stackoverflow.com/a/76578587
    const renderDay = (props) => {
        const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

        const isHighlighted =
            !outsideCurrentMonth &&
            highlightedDays.includes(day.format(DATE_FORMAT));

        const isActuallySelected =
            !outsideCurrentMonth &&
            day.format(DATE_FORMAT) === dayjs(turno.fecha.dato).format(DATE_FORMAT);

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

    //--------------------------------------------------------------------------
    const timeErrorMessage = useMemo(() => {
        if (Object.keys(timeError).length === 0){
            return '';
        }
        switch (timeError.err) {
            case 'maxTime':
            case 'minTime': {
                turno.hora.error = true;
                return 'Este dato es obligatorio. Verifique haber seleccionado entre el mínimo y máximo.';
            }
            case 'invalidDate': {
                turno.hora.error = true;
                return 'Verifique que haya seleccionado un horario';
            }
            default: {
                turno.hora.error = false;
                return '';
            }
        }
    }, [timeError]);
    //--------------------------------------------------------------------------
    const handleOnChange = (dte) => {
        if (!dte){
            // Si no hay horario para ese día -> todo deshabilitado
            setMedicoHorario({
                minTime: null, // Antes eran los por defecto: medicoHor.minTime
                maxTime: null, // Antes eran los por defecto: medicoHor.maxTime
            });

            return
        }

        onChangeDate(dte);
    }

    useEffect(() => {
        // Cuando cambia el médico o el horarioSemanal: recalcular inmediatamente
        if (fecha) {
            const diaSemana = fecha.day() === 0 ? 7 : fecha.day();
            const dia = horarioSemanal.find(d => d.diaSemana === diaSemana);

            if (dia && dia.hora_atencion_inicio && dia.hora_atencion_fin) {
                setMedicoHorario({
                    minTime: dayjs(dia.hora_atencion_inicio, TIME_FORMAT),
                    maxTime: dayjs(dia.hora_atencion_fin, TIME_FORMAT),
                });
            } else {
                // No atiende en ese día -> bloquear todo
                setMedicoHorario({
                    minTime: null,
                    maxTime: null,
                });
            }
        }
    }, [medicoHor, horarioSemanal, fecha]);

    //**************************************************************************
    //**************************************************************************
    //**************************************************************************
    return (
        <>
            <Grid size={{ xs: 12, md: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es" localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}>
                    <StaticDatePicker
                        name={turno.fecha.campo}
                        label="Fecha"
                        value={turno.fecha.dato}
                        onChange={(date)=>handleOnChange(date)}
                        defaultValue={fecha}
                        maxDate={hoy.add(2, "month")}

                        slots={{day: renderDay,}}
                        slotProps={{
                            day: {highlightedDays,},
                            actionBar: {actions: ['today', 'clear'],},
                        }}
                        shouldDisableDate={disableThisDay}

                        PaperProps={{
                            sx: {
                            }
                        }}
                    />
                </LocalizationProvider>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es" localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}>
                    <StaticTimePicker
                        name={turno.hora.campo}
                        label="Hora"
                        //value={dayjs(turno.hora.dato, 'HH:mm:ss')}
                        value={medicoHorario.minTime === null ? null : dayjs(turno.hora.dato, 'HH:mm:ss')}
                        onChange={(time) => onChangeTime(time, turno.hora.campo)}
                        onError={(newError) => {
                            setTimeError({err: newError, fld: turno.hora.campo});
                            turno.hora.error = Boolean(newError);
                        }}
                        slotProps={{
                            textField: {
                                error: turno.hora.error,
                                helperText: turno.hora.error?timeErrorMessage:'',
                            },
                            actionBar: {actions: ['clear'],},
                        }}
                        views={['hours']}
                        viewRenderers={{
                            hours: renderTimeViewClock
                        }}
                        ampm={false}
                        //minutesStep={30}
                        shouldDisableTime={disableThisTimes}
                        minTime={medicoHorario.minTime}
                        maxTime={medicoHorario.maxTime}
                        sx={{ backgroundColor: 'transparent' }}
                    />
                    <Typography variant="p" className="helper-text-error" >
                        {turno.hora.error?timeErrorMessage:''}
                    </Typography>
                </LocalizationProvider>
            </Grid>
        </>
    );
};