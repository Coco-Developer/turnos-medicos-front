import React, { memo } from "react";
import { TextField, Grid } from "@mui/material";

/**
 * Pasamos solo los campos específicos y las funciones de control.
 * Esto hace que el componente sea realmente "Pure" y vuele.
 */
export const PersonalInfoInputs = memo(({ apellido, nombre, onChange, onBlur }) => {
    
    return (
        <>
            <Grid item xs={12} md={6}>
                <TextField
                    name="apellido" // Usamos el string directo para evitar dependencias
                    label="Apellido"
                    variant="outlined"
                    fullWidth
                    required
                    onChange={onChange}
                    onBlur={onBlur}
                    value={apellido.dato}
                    error={apellido.error}
                    helperText={apellido.error ? "Debe ingresar el apellido" : ""}
                    // Muy importante para carga de datos de API:
                    InputLabelProps={{ shrink: true }} 
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    name="nombre"
                    label="Nombre"
                    variant="outlined"
                    fullWidth
                    required
                    onChange={onChange}
                    onBlur={onBlur}
                    value={nombre.dato}
                    error={nombre.error}
                    helperText={nombre.error ? "Debe ingresar el nombre" : ""}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
        </>
    );
});

PersonalInfoInputs.displayName = "PersonalInfoInputs";