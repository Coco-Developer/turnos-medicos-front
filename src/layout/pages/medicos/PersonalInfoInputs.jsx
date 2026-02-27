import React, { memo } from "react";
import Grid from '@mui/material/Grid';
import { TextField } from "@mui/material";
import { handleValidation } from "./FnGen";

// Desacoplamos: recibimos solo apellido, nombre, setMedico y onChange
export const PersonalInfoInputs = memo(({ apellido, nombre, setMedico, onChange }) => {
    
    // Salvaguarda para evitar errores si las propiedades no están definidas
    if (!apellido || !nombre) return null;

    return (
        <>
            <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                    name={apellido.campo}
                    label="Apellido"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={apellido.requerido}
                    onChange={onChange}
                    // Validación focalizada en las piezas de estado locales al componente
                    onBlur={(e) => handleValidation({ apellido, nombre }, setMedico)(e)}
                    value={apellido.dato || ""}
                    error={apellido.error}
                    helperText={apellido.error ? "Debe ingresar el apellido" : ""}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                    name={nombre.campo}
                    label="Nombre"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={nombre.requerido}
                    onChange={onChange}
                    // Validación focalizada en las piezas de estado locales al componente
                    onBlur={(e) => handleValidation({ apellido, nombre }, setMedico)(e)}
                    value={nombre.dato || ""}
                    error={nombre.error}
                    helperText={nombre.error ? "Debe ingresar el nombre" : ""}
                />
            </Grid>
        </>
    );
});

PersonalInfoInputs.displayName = "PersonalInfoInputs";