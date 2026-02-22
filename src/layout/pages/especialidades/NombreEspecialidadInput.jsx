import React from "react";
import Grid from '@mui/material/Grid';
import { TextField } from "@mui/material";

export const NombreEspecialidadInput = ({ especialidad, setEspecialidad, onChange }) => {
    return (
        <Grid size={{ xs: 12, md: 12 }}>
            <TextField
                name={especialidad.nombre.campo}
                label={especialidad.nombre.rotulo}
                variant="outlined"
                fullWidth
                margin="normal"
                required={especialidad.nombre.requerido}
                onChange={onChange}
                value={especialidad.nombre.dato}
                error={especialidad.nombre.error}
                helperText={especialidad.nombre.error ? "Este campo es obligatorio." : ""}
            />
        </Grid>
    );
};