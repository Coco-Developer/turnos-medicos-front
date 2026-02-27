import React, { memo, useCallback, useMemo } from "react";
import { LocalizationProvider, TimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { esES } from "@mui/x-date-pickers/locales";
import dayjs from "dayjs";
import {
    Grid, Box, Typography, IconButton, Card, CardContent,
    Stack, Tooltip, Divider, useTheme
} from "@mui/material";
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { DAYS } from "../../libs/constants";

// --- COMPONENTE DE CELDA DE TIEMPO (Optimización de Renderizado) ---
const TimeInput = memo(({ label, value, error, errorCode, onChange, defaultValues }) => {
    const toPickerValue = (dato) => {
        if (!dato) return null;
        const d = dayjs(dato, "HH:mm:ss");
        return d.isValid() ? d : null;
    };

    const getErrorMessage = (code) => {
        if (!code) return "";
        const messages = {
            required: "Obligatorio",
            invalidDate: "Formato HH:mm",
            outOfRange: "Fuera de rango",
            pairMismatch: "Incompleto"
        };
        return messages[code] || "";
    };

    return (
        <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                {label}
            </Typography>
            <TimePicker
                value={toPickerValue(value)}
                onChange={onChange}
                views={["hours", "minutes"]}
                viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }}
                ampm={false}
                slotProps={{
                    textField: {
                        size: "small",
                        fullWidth: true,
                        error: !!error,
                        helperText: error ? getErrorMessage(errorCode) : "",
                        placeholder: "00:00"
                    }
                }}
            />
        </Box>
    );
});

// --- TARJETA POR DÍA (Aísla el re-renderizado) ---
const DayCard = memo(({ day, inicioField, finField, onTimeChange, onClear }) => {
    const theme = useTheme();
    // Detectamos si el día tiene asignada alguna hora
    const hasData = Boolean(inicioField?.dato || finField?.dato);

    return (
        <Grid item xs={12} sm={6} md={4} lg={3}>
            <Card
                elevation={0}
                sx={{
                    border: '1px solid',
                    borderColor: hasData ? 'primary.main' : 'divider',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    // Si no tiene data, se ve ligeramente más opaco y gris
                    opacity: hasData ? 1 : 0.7,
                    bgcolor: hasData ? 'background.paper' : theme.palette.action.hover,
                    '&:hover': {
                        boxShadow: theme.shadows[4],
                        opacity: 1
                    }
                }}
            >
                <Box sx={{
                    p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    bgcolor: hasData ? 'primary.main' : 'text.disabled',
                    color: 'white',
                    transition: 'background-color 0.3s ease'
                }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {day.label}
                    </Typography>
                    {hasData && (
                        <IconButton size="small" onClick={() => onClear(day.key)} sx={{ color: 'white' }}>
                            <DeleteSweepIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>
                <CardContent sx={{ p: 2 }}>
                    <Stack spacing={2}>
                        <TimeInput
                            label="ENTRADA"
                            value={inicioField?.dato}
                            error={inicioField?.error}
                            onChange={(v) => onTimeChange(v, `horarioatencion_${day.key}_inicio`)}
                        />
                        <TimeInput
                            label="SALIDA"
                            value={finField?.dato}
                            error={finField?.error}
                            onChange={(v) => onTimeChange(v, `horarioatencion_${day.key}_fin`)}
                        />
                    </Stack>
                </CardContent>
            </Card>
        </Grid>
    );
});

// --- COMPONENTE PRINCIPAL ---
export const SchedulePicker = memo(({ medico, setMedico, defaultValues }) => {

    const handleTimeChanged = useCallback((time, key) => {
        setMedico(prev => {
            // Clonamos solo lo necesario para mantener inmutabilidad
            const currentField = prev?.[key] || { campo: key, dato: null };

            // Si el valor es idéntico, no disparamos actualización (evita loops)
            if (currentField.dato === time) return prev;

            const next = {
                ...prev,
                [key]: { ...currentField, dato: time, error: false, errorCode: null }
            };

            // Lógica de validación de pares (Inicio/Fin)
            const [, dayKey] = key.split("_");
            const inicioKey = `horarioatencion_${dayKey}_inicio`;
            const finKey = `horarioatencion_${dayKey}_fin`;

            const inicio = next[inicioKey]?.dato;
            const fin = next[finKey]?.dato;

            const isInvalid = (inicio && !fin) || (!inicio && fin);

            // Solo actualizamos si el estado de error realmente cambió
            if (next[inicioKey]) {
                next[inicioKey] = { ...next[inicioKey], error: isInvalid, errorCode: isInvalid ? 'pairMismatch' : null };
            }
            if (next[finKey]) {
                next[finKey] = { ...next[finKey], error: isInvalid, errorCode: isInvalid ? 'pairMismatch' : null };
            }

            return next;
        });
    }, [setMedico]);

    const clearDay = useCallback((dayKey) => {
        handleTimeChanged(null, `horarioatencion_${dayKey}_inicio`);
        handleTimeChanged(null, `horarioatencion_${dayKey}_fin`);
    }, [handleTimeChanged]);

    return (
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="es"
            localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
        >
            <Box sx={{ width: '100%', my: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3, ml: 1 }}>
                    <AccessTimeIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>Configuración de Horarios</Typography>
                </Stack>

                <Grid container spacing={2.5}>
                    {DAYS.map((d) => (
                        <DayCard
                            key={d.key}
                            day={d}
                            inicioField={medico[`horarioatencion_${d.key}_inicio`]}
                            finField={medico[`horarioatencion_${d.key}_fin`]}
                            onTimeChange={handleTimeChanged}
                            onClear={clearDay}
                        />
                    ))}
                </Grid>
            </Box>
        </LocalizationProvider>
    );
});

SchedulePicker.displayName = "SchedulePicker";