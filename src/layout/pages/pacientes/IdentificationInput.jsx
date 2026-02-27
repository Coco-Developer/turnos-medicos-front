import React, { memo } from "react";
import { TextField, Grid } from "@mui/material";

/**
 * Al pasarle solo 'dni', 'onChange' y 'onBlur', React Memo
 * realmente puede comparar si el valor cambió y evitar renders inútiles.
 */
export const IdentificationInput = memo(({ dni, onChange, onBlur }) => {
    
    return (
        <Grid item xs={12} md={6}>
            <TextField
                name="dni" // Nombre del campo directo
                label="DNI"
                variant="outlined"
                fullWidth
                margin="normal"
                type="number" // Asegura que solo entren números
                required={dni.requerido}
                onChange={onChange}
                onBlur={onBlur} // La función viene pre-configurada del padre
                value={dni.dato}
                error={dni.error}
                helperText={
                    dni.error 
                        ? "Debe ingresar el número de documento" 
                        : "También usado como nombre de Usuario. Solo ingresar números."
                }
                // Evita que el label se pise con el número al cargar datos
                InputLabelProps={{ shrink: true }}
            />
        </Grid>
    );
});

IdentificationInput.displayName = "IdentificationInput";