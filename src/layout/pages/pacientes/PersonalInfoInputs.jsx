import React from "react";
import { TextField } from "@mui/material";
import Grid from '@mui/material/Grid';
import {handleValidation} from "./FnGen";

export const PersonalInfoInputs = ({ paciente, setPaciente, onChange }) => {
    return (
        <>
            <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                    name={paciente.apellido.campo}
                    label="Apellido"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={paciente.apellido.requerido}
                    onChange={onChange}
                    onBlur={handleValidation(paciente, setPaciente)}
                    value={paciente.apellido.dato}
                    error={paciente.apellido.error}
                    helperText={paciente.apellido.error ? "Debe ingresar el apellido" : ""}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                    name={paciente.nombre.campo}
                    label="Nombre"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={paciente.nombre.requerido}
                    onChange={onChange}
                    onBlur={handleValidation(paciente, setPaciente)}
                    value={paciente.nombre.dato}
                    error={paciente.nombre.error}
                    helperText={paciente.nombre.error ? "Debe ingresar el nombre" : ""}
                />
            </Grid>
        </>
    );
};