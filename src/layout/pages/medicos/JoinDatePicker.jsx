import React, { useState, useMemo, memo, useCallback } from "react";
import Grid from '@mui/material/Grid';
import { LocalizationProvider, DatePicker, TimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { esES } from '@mui/x-date-pickers/locales';
import dayjs from "dayjs";
import { Box, Typography, IconButton } from "@mui/material";
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { DAYS } from "../../libs/constants";

// ==========================================
// JOIN DATE PICKER
// ==========================================
export const JoinDatePicker = memo(({ fechaaltalaboral, setMedico }) => {
    const [dateError, setDateError] = useState();

    const handleDateChange = (dte) => {
        setMedico((prev) => ({
            ...prev,
            ['fechaaltalaboral']: { 
                ...prev['fechaaltalaboral'], 
                dato: dte 
            }
        }));
    };

    const dateErrorMessage = useMemo(() => {
        switch (dateError) {
            case 'maxDate':
            case 'minDate': return 'Este dato es obligatorio.';
            case 'invalidDate': return 'Fecha no válida.';
            default: return '';
        }
    }, [dateError]);

    return (
        <Grid size={{ xs: 12, md: 6 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es" localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}>
                <DatePicker
                    name={fechaaltalaboral.campo}
                    label="Fecha de Alta Laboral"
                    sx={{ width: '100%', mt: 2, mb: 1 }}
                    required={fechaaltalaboral.requerido}
                    onChange={handleDateChange}
                    value={dayjs(fechaaltalaboral.dato).isValid() ? dayjs(fechaaltalaboral.dato) : null}
                    onError={(newError) => setDateError(newError)}
                    slotProps={{
                        textField: {
                            helperText: dateErrorMessage,
                            error: !!dateError || fechaaltalaboral.error,
                            variant: "outlined"
                        },
                    }}
                />
            </LocalizationProvider>
        </Grid>
    );
});

JoinDatePicker.displayName = "JoinDatePicker";