import React, { memo } from "react";
import Grid from '@mui/material/Grid';
import { TextField } from "@mui/material";
import { handleValidation } from "./FnGen";

// Desacoplamos: extraemos dni y matricula del objeto global
export const IdentificationInput = memo(({ dni, matricula, setMedico, onChange }) => {
    
    // Salvaguarda para evitar renderizar sin datos
    if (!dni || !matricula) return null;

    return (
        <>
            <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                    name={dni.campo}
                    label="DNI"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={dni.requerido}
                    onChange={onChange}
                    // Validación focalizada en las props del componente
                    onBlur={(e) => handleValidation({ dni, matricula }, setMedico)(e)}
                    value={dni.dato || ""}
                    error={dni.error}
                    helperText={dni.error ? "Debe ingresar el número de documento" : ""}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                    name={matricula.campo}
                    label="Matrícula"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={matricula.requerido}
                    onChange={onChange}
                    // Validación focalizada en las props del componente
                    onBlur={(e) => handleValidation({ dni, matricula }, setMedico)(e)}
                    value={matricula.dato || ""}
                    error={matricula.error}
                    helperText={matricula.error ? "Debe ingresar la matrícula" : ""}
                />
            </Grid>
        </>
    );
});

IdentificationInput.displayName = "IdentificationInput";