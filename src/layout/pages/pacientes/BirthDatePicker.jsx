import React, { useState, useMemo } from "react";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import Grid from '@mui/material/Grid';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export const BirthDatePicker = ({ paciente, setPaciente }) => {
    const [dateError, setDateError] = useState();

    const handleDateChange = (dte, nme) => {
        const pac = { ...paciente[nme], ...{ dato: dte?.$d } };
        setPaciente({ ...paciente, [nme]: pac });
    };

    const dateErrorMessage = useMemo(() => {
        switch (dateError) {
            case 'maxDate':
            case 'minDate':
                return 'Este dato es obligatorio.';
            case 'invalidDate':
                return 'Fecha no válida.';
            default:
                return '';
        }
    }, [dateError]);

    return (
        <Grid size={{ xs: 12, md: 6 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <DatePicker
                    name={paciente.fechanacimiento.campo}
                    label="Fecha de Nacimiento"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={paciente.fechanacimiento.requerido}
                    disableFuture
                    onChange={(date) => handleDateChange(date, paciente.fechanacimiento.campo)}
                    value={paciente.fechanacimiento.dato ? dayjs(paciente.fechanacimiento.dato) : null}
                    onError={(newError) => setDateError(newError)}
                    slotProps={{
                        textField: {
                            helperText: paciente.fechanacimiento.error ? dateErrorMessage : '',
                        },
                    }}
                />
            </LocalizationProvider>
        </Grid>
    );
};