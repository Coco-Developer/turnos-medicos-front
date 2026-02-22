import React, {useMemo, useState} from "react";
import {LocalizationProvider, TimePicker, renderTimeViewClock} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {esES} from "@mui/x-date-pickers/locales";
import dayjs from "dayjs";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {DAYS} from "../../libs/constants";

export const SchedulePicker = ({medico, setMedico, defaultValues}) => {
    const [timeErrors, setTimeErrors] = useState({}); // { key1: "invalidDate", key2: "minTime", ... }
    const types = [
        {key: "inicio", label: "Inicio"},
        {key: "fin", label: "Fin"},
    ];

    const fieldKey = (dayKey, typeKey) => `horarioatencion_${dayKey}_${typeKey}`;
    const parseToDayjs = (v) => (dayjs.isDayjs(v) ? v : dayjs(v, "HH:mm:ss"));
    const toPickerValue = (dato) => (dato === null ? null : parseToDayjs(dato));
    const ensureField = (key, fallbackDato) => {
        return medico?.[key] ?? {campo: key, dato: fallbackDato, requerido: false, error: false};
    };
    //--------------------------------------------------------------------------
    const handleTimeChanged = (time, key) => {
        // time puede ser: dayjs object o null (cuando se cliquea "Limpiar")
        setMedico(prev => {
            const current = prev?.[key] ?? { campo: key, dato: null, requerido: false, error: false };
            const updated = { ...current, dato: time === null ? null : time, error: false };
            const next = { ...prev, [key]: updated };

            // Validación de pares inicio-fin
            const [ , dayKey, typeKey ] = key.split("_"); // ej: horarioatencion_lun_inicio
            const inicioKey = `horarioatencion_${dayKey}_inicio`;
            const finKey = `horarioatencion_${dayKey}_fin`;
            const inicio = next[inicioKey]?.dato ?? null;
            const fin = next[finKey]?.dato ?? null;

            const pairInvalid = (inicio && !fin) || (!inicio && fin);

            if (pairInvalid) {
                // Marcar error en ambos
                next[inicioKey] = { ...next[inicioKey], error: true };
                next[finKey] = { ...next[finKey], error: true };
                setTimeErrors(prevErr => ({
                    ...prevErr,
                    [inicioKey]: "pairMismatch",
                    [finKey]: "pairMismatch"
                }));
            } else {
                // Limpiar error si ambos null o ambos válidos
                next[inicioKey] = { ...next[inicioKey], error: false };
                next[finKey] = { ...next[finKey], error: false };
                setTimeErrors(prevErr => ({
                    ...prevErr,
                    [inicioKey]: null,
                    [finKey]: null
                }));
            }

            return next;
        });
    };
    //--------------------------------------------------------------------------
    const handleBlur = (event) => {
        // Si viene con la cadena por defecto, limpiar
        event.target.value = event.target.value === 'hh:mm'? '': event.target.value;

        const key = event.target.name;

        if (!event.target.value) {
            setTimeErrors(prev => ({ ...prev, [key]: null }));
            setMedico(prev => {
                const cur = prev?.[key] ?? { campo: key, dato: null, requerido: false, error: false };
                return { ...prev, [key]: { ...cur, dato: null, error: false } };
            });
            return;
        }

        // Validación estricta de formato HH:mm
        const isValid = dayjs(event.target.value, "HH:mm", true).isValid();
        if (!isValid) {
            setTimeErrors(prev => ({ ...prev, [key]: "invalidDate" }));
            setMedico(prev => {
                const cur = prev?.[key] ?? { campo: key, dato: null, requerido: false, error: false };
                return { ...prev, [key]: { ...cur, error: true } };
            });
        } else {
            setTimeErrors(prev => ({ ...prev, [key]: null }));
            setMedico(prev => {
                const cur = prev?.[key] ?? { campo: key, dato: null, requerido: false, error: false };
                return { ...prev, [key]: { ...cur, error: false } };
            });
        }
    };
    //--------------------------------------------------------------------------
    const handleTimeError = (key, newError, context) => {
        // Si context?.value === null => es porque se hizo clic en "Limpiar"
        if (context?.value === null) {
            setTimeErrors(prev => ({ ...prev, [key]: null }));
            setMedico(prev => {
                const cur = prev?.[key] ?? { campo: key, dato: null, requerido: false, error: false };
                return { ...prev, [key]: { ...cur, dato: null, error: false } };
            });
            return;
        }

        if (newError) {
            setTimeErrors(prev => ({ ...prev, [key]: newError }));
            setMedico(prev => {
                const cur = prev?.[key] ?? { campo: key, dato: null, requerido: false, error: false };
                return { ...prev, [key]: { ...cur, error: true } };
            });
        } else {
            setTimeErrors(prev => ({ ...prev, [key]: null }));
            setMedico(prev => {
                const cur = prev?.[key] ?? { campo: key, dato: null, requerido: false, error: false };
                return { ...prev, [key]: { ...cur, error: false } };
            });
        }
    };

    const getErrorMessage = (errorCode, defaultValues) => {
        if (!errorCode) return "";

        switch (errorCode) {
            case "required":
                return "Este campo es obligatorio.";
            case "invalidDate":
                return "Hora no válida. Formato HH:mm.";
            case "outOfRange":
                return `La hora debe estar entre ${defaultValues.minTime.format("HH:mm")} y ${defaultValues.maxTime.format("HH:mm")}.`;
            case "pairMismatch":
                return "Debe completar inicio y fin o dejar ambos vacíos.";
            case "noWorkingDay":
                return "Al menos un día completo (inicio y fin) debe estar definido.";
            default:
                return "";
        }
    };

    //**************************************************************************
    //**************************************************************************
    //**************************************************************************
    return (
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="es"
            localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
        >
            <Grid
                size={{xs: 12, md: 12}}
                sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}
            >
                <Box component="fieldset" className="fieldset">
                    <Typography component="legend">Horario</Typography>

                    <div style={{overflowX: "auto"}}>
                        <table style={{width: "100%", borderCollapse: "collapse"}}>
                            <thead>
                            <tr>
                                <th style={{textAlign: "left", padding: 8, borderBottom: "1px solid #ddd"}}>Tipo</th>
                                {DAYS.map((d) => (
                                    <th key={d.key} style={{textAlign: "center", padding: 8, borderBottom: "1px solid #ddd"}}>
                                        {d.label}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {types.map((t) => (
                                <tr key={t.key}>
                                    <td style={{padding: 8, fontWeight: 600}}>{t.label}</td>
                                    {DAYS.map((d) => {
                                        const key = fieldKey(d.key, t.key);
                                        const fallback = t.key === "inicio" ? defaultValues.iniTime : defaultValues.endTime;
                                        const field = ensureField(key, fallback);
                                        const m = medico[key] ?? {};
                                        const externalError = Boolean(m.error); // error global (viene de validateForm)
                                        const pickerHasError = Boolean(timeErrors[key]);
                                        const combinedError = externalError || pickerHasError;
                                        // const helpText = pickerHasError
                                        //     ? getErrorMessage(timeErrors[key])
                                        //     : externalError
                                        //         ? (field.helperText || "Al menos un día completo (inicio y fin) debe estar definido.")
                                        //         : "";

                                        const helpText = pickerHasError
                                            ? getErrorMessage(timeErrors[key], defaultValues)
                                            : getErrorMessage(m.errorCode, defaultValues);

                                        return (
                                            <td key={key} style={{padding: 8, textAlign: "center", verticalAlign: "top"}}>
                                                <TimePicker
                                                    name={field.campo}
                                                    label=""
                                                    value={toPickerValue(field.dato)}
                                                    onChange={(time) => handleTimeChanged(time, key)}
                                                    onError={(newError, context) => handleTimeError(key, newError, context)}
                                                    views={["hours", "minutes"]}
                                                    viewRenderers={{
                                                        hours: renderTimeViewClock,
                                                        minutes: renderTimeViewClock
                                                    }}
                                                    ampm={false}
                                                    minutesStep={15}
                                                    minTime={defaultValues.minTime}
                                                    maxTime={defaultValues.maxTime}
                                                    skipDisabled={true}
                                                    onClose={() => {
                                                        // Al cerrar el TimePicker, limpiar errores previos para esa celda
                                                        setTimeErrors(prev => ({ ...prev, [key]: null }) );
                                                    }}
                                                    slotProps={{
                                                        actionBar: {
                                                            actions: ['clear', 'accept']
                                                        },
                                                        textField: {
                                                            size: "small",
                                                            fullWidth: true,
                                                            margin: "dense",
                                                            placeholder: "HH:mm",
                                                            onBlur: handleBlur,
                                                            error: combinedError, //Boolean(timeErrors[key]),
                                                            helperText: helpText, //timeErrors[key]? getErrorMessage(timeErrors[key]): "",
                                                        },
                                                    }}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </Box>
            </Grid>
        </LocalizationProvider>
    );
};