import React, { useState, useMemo, memo } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Grid } from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/es";

// Mover la configuración de locale fuera del render para evitar re-ejecuciones
dayjs.locale("es");

export const BirthDatePicker = memo(({ fechanacimiento, setPaciente }) => {
    const [dateError, setDateError] = useState(null);

    const handleDateChange = (newDate) => {
        // Validación básica: si es una fecha inválida de dayjs, no actualizamos el 'dato'
        // pero sí podemos marcar que hay un error.
        const isValid = newDate === null || (dayjs(newDate).isValid() && !dayjs(newDate).isAfter(dayjs()));

        setPaciente(prev => ({
            ...prev,
            fechanacimiento: { 
                ...prev.fechanacimiento, 
                dato: newDate, 
                error: !isValid || (!newDate && prev.fechanacimiento.requerido)
            }
        }));
    };

    const errorMessage = useMemo(() => {
        if (dateError === 'invalidDate') return 'Fecha no válida.';
        if (dateError === 'disableFuture') return 'No puede ser una fecha futura.';
        if (fechanacimiento.error && !fechanacimiento.dato) return 'La fecha es obligatoria.';
        return '';
    }, [dateError, fechanacimiento.error, fechanacimiento.dato]);

    return (
        <Grid item xs={12} md={6}>
            {/* El LocalizationProvider debería envolver idealmente toda la App, 
                pero si lo dejas aquí, asegúrate que el adapter esté bien configurado */}
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <DatePicker
                    label="Fecha de Nacimiento"
                    // Nos aseguramos de que el valor sea siempre un objeto dayjs o null
                    value={fechanacimiento.dato ? dayjs(fechanacimiento.dato) : null}
                    onChange={handleDateChange}
                    disableFuture
                    onError={(newError) => setDateError(newError)}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            margin: "normal",
                            error: !!dateError || fechanacimiento.error,
                            helperText: errorMessage,
                            InputLabelProps: { shrink: true },
                            // Evitamos que el usuario escriba cualquier cosa manualmente
                            // si prefieres que solo use el calendario:
                            // readOnly: true 
                        },
                    }}
                />
            </LocalizationProvider>
        </Grid>
    );
});

BirthDatePicker.displayName = "BirthDatePicker";