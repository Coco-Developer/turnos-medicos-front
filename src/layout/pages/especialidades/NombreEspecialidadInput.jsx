import React from "react";
import { TextField, Box } from "@mui/material";

export const NombreEspecialidadInput = ({ especialidad, onChange }) => {
    return (
        <Box sx={{ width: '100%' }}>
            <TextField
                name={especialidad.nombre.campo}
                label={especialidad.nombre.rotulo}
                variant="outlined"
                fullWidth
                // Margin normal añade espacio arriba/abajo coherente con los otros formularios
                margin="normal" 
                required={especialidad.nombre.requerido}
                onChange={onChange}
                value={especialidad.nombre.dato}
                error={especialidad.nombre.error}
                helperText={especialidad.nombre.error ? "Este campo es obligatorio." : ""}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2, // Bordes un poco más redondeados para un look moderno
                    },
                }}
            />
        </Box>
    );
};