import React, { memo, useMemo } from "react";
import { LocalizationProvider, StaticDatePicker, StaticTimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Grid, Typography, Box } from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/es";

export const FechaHoraPicker = memo(({
    turno,
    fecha,
    horarioMedico,
    horarioSemanal = [],
    unavailableTimes = [],
    disabled = false,
    onChangeDate,
    onChangeTime
}) => {
    const blockedTimes = useMemo(() => new Set(unavailableTimes), [unavailableTimes]);

    const timeValue = useMemo(() => {
        if (!turno.hora.dato) return null;
        const parsed = dayjs(turno.hora.dato);
        return parsed.isValid() ? parsed : null;
    }, [turno.hora.dato]);

    const dateValue = useMemo(() => {
        const parsed = turno.fecha.dato ? dayjs(turno.fecha.dato) : dayjs(fecha);
        return parsed.isValid() ? parsed : dayjs();
    }, [turno.fecha.dato, fecha]);

    const shouldDisableDate = (date) => {
        if (disabled) return true;
        const dayIndex = date.day() === 0 ? 7 : date.day();
        const diaAgenda = horarioSemanal.find((d) => Number(d.diaSemana) === dayIndex);
        return !(diaAgenda?.horarioAtencionInicio && diaAgenda?.horarioAtencionFin);
    };

    const shouldDisableTime = (value, view) => {
        if (!horarioMedico?.horaInicio || !horarioMedico?.horaFin) return true;

        const [hInicio, mInicio] = horarioMedico.horaInicio.split(":").map(Number);
        const [hFin, mFin] = horarioMedico.horaFin.split(":").map(Number);

        if (view === "hours") {
            const hora = value.hour();
            return hora < hInicio || hora > hFin;
        }

        if (view === "minutes") {
            const hora = value.hour();
            const minuto = value.minute();

            if (hora === hInicio && minuto < mInicio) return true;
            if (hora === hFin && minuto > mFin) return true;

            const hhmm = `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
            return blockedTimes.has(hhmm);
        }

        return false;
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <Grid container spacing={3}>
                <Grid item xs={12} xl={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: "primary.main" }}>
                        1. Seleccione Fecha
                    </Typography>
                    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                        <StaticDatePicker
                            displayStaticWrapperAs="desktop"
                            value={dateValue}
                            onChange={(newDate) => {
                                if (!newDate || shouldDisableDate(newDate)) return;
                                onChangeDate(newDate);
                            }}
                            shouldDisableDate={shouldDisableDate}
                            disabled={disabled}
                            slotProps={{
                                toolbar: { hidden: true },
                                actionBar: { actions: [] }
                            }}
                        />
                    </Box>
                </Grid>

                <Grid item xs={12} xl={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: "primary.main" }}>
                        2. Seleccione Hora
                    </Typography>
                    <Box
                        sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            overflow: "hidden",
                            bgcolor: "background.paper",
                            "& .Mui-disabled": {
                                backgroundColor: "rgba(0, 0, 0, 0.04)"
                            }
                        }}
                    >
                        <StaticTimePicker
                            ampm={false}
                            value={timeValue}
                            onChange={(newValue) => onChangeTime(newValue, "hora")}
                            shouldDisableTime={shouldDisableTime}
                            timeSteps={{ minutes: 30 }}
                            disabled={disabled}
                            viewRenderers={{
                                hours: renderTimeViewClock,
                                minutes: renderTimeViewClock
                            }}
                            slotProps={{
                                actionBar: { actions: ["today"] },
                                toolbar: { hidden: true }
                            }}
                        />
                    </Box>
                </Grid>
            </Grid>
        </LocalizationProvider>
    );
});

FechaHoraPicker.displayName = "FechaHoraPicker";
