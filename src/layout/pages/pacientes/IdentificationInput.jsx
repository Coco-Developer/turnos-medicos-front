import React from "react";
import {TextField, Tooltip} from "@mui/material";
import Grid from '@mui/material/Grid';
import {handleValidation} from "./FnGen";

export const IdentificationInput = ({ paciente, setPaciente, onChange }) => {
    return (
        <Grid size={{ xs: 12, md: 6 }}>
            <TextField
                name={paciente.dni.campo}
                label="DNI"
                variant="outlined"
                fullWidth
                margin="normal"
                required={paciente.dni.requerido}
                onChange={onChange}
                onBlur={handleValidation(paciente, setPaciente)}
                value={paciente.dni.dato}
                error={paciente.dni.error}
                helperText={paciente.dni.error ? "Debe ingresar el número de documento" : "También usado como nombre de Usuario. Solo ingresar números."}
            />
        </Grid>
    );
};