import React, { useState, useMemo } from "react";
import { DatePicker, LocalizationProvider, PickersDay } from "@mui/x-date-pickers";
import { esES } from '@mui/x-date-pickers/locales';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { styled } from "@mui/material";
import dayjs from "dayjs";
import 'dayjs/locale/es';
import {DATE_FORMAT} from "../../libs/constants";

const HighlightedDay = styled(PickersDay)(({ theme }) => ({
    "&.Mui-selected": {
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.secondary.contrastText,
    },
}));

export const DateSelector = ({ fecha, onDateChange, onMonthChange, fechasconturno }) => {
    const [dateError, setDateError] = useState();
    //--------------------------------------------------------------------------
    const dateErrorMessage = useMemo(() => {
        switch (dateError) {
            case 'invalidDate': return 'Fecha no válida.';
            default: return '';
        }
    }, [dateError]);
    //--------------------------------------------------------------------------
    const renderDay = (props) => {
        const { day, outsideCurrentMonth, ...other } = props;
        const isSelected = !outsideCurrentMonth && fechasconturno.includes(day.format(DATE_FORMAT));

        return (
            <HighlightedDay
                {...other}
                outsideCurrentMonth={outsideCurrentMonth}
                day={day}
                selected={isSelected}
            />
        );
    };
    //**************************************************************************
    //**************************************************************************
    //**************************************************************************
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es" localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}>
            <DatePicker
                name="fecha"
                label="Fecha"
                variant="outlined"
                fullWidth
                margin="normal"
                value={fecha}
                onChange={onDateChange}
                onMonthChange={onMonthChange}
                defaultValue={dayjs()}
                onError={(newError) => setDateError(newError)}
                slots={{ day: renderDay }}
                slotProps={{
                    day: { fechasconturno },
                    actionBar: { actions: ['today', 'clear'] },
                    textField: { helperText: dateError ? dateErrorMessage : '' },
                }}
                sx={{ backgroundColor: 'transparent' }}
            />
        </LocalizationProvider>
    );
};
