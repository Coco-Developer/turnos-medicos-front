import React from "react";
import { TextField } from "@mui/material";
import Grid from '@mui/material/Grid';
import {handleValidation} from "./FnGen";

export const ContactInfoInputs = ({ paciente, setPaciente, onChange }) => {
    return (
        <>
            <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                    name={paciente.telefono.campo}
                    label="Teléfono"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={paciente.telefono.requerido}
                    onChange={onChange}
                    onBlur={handleValidation(paciente, setPaciente)}
                    onKeyUp={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                            event.preventDefault();
                        }
                    }}
                    value={paciente.telefono.dato}
                    error={paciente.telefono.error}
                    helperText={paciente.telefono.error ? "Debe ingresar el teléfono" : ""}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                    name={paciente.email.campo}
                    label="Email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={paciente.email.requerido}
                    onChange={onChange}
                    onBlur={handleValidation(paciente, setPaciente)}
                    value={paciente.email.dato}
                    error={paciente.email.error}
                    helperText={paciente.email.error ? "El formato es incorrecto" : ""}
                />
            </Grid>
        </>
    );
};