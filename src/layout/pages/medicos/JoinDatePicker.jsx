import React, { useState, useMemo } from "react";
import Grid from '@mui/material/Grid';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { esES } from '@mui/x-date-pickers/locales';
import dayjs from "dayjs";

export const JoinDatePicker = ({ medico, setMedico }) => {
    const [dateError, setDateError] = useState();

    const handleDateChange = (dte) => {
        const med = { ...medico['fechaaltalaboral'], ...{ dato: dte } };
        setMedico({ ...medico, ['fechaaltalaboral']: med });
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
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es" localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}>
                <DatePicker
                    name={medico.fechaaltalaboral.campo}
                    label="Fecha de Alta Laboral"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={medico.fechaaltalaboral.requerido}
                    onChange={handleDateChange}
                    value={dayjs(medico.fechaaltalaboral.dato)}
                    onError={(newError) => setDateError(newError)}
                    slotProps={{
                        textField: {
                            helperText: dateErrorMessage,
                        },
                    }}
                />
            </LocalizationProvider>
        </Grid>
    );
};