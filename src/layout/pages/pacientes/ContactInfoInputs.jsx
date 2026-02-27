import React, { memo } from "react";
import { TextField, Grid } from "@mui/material";

/**
 * Al recibir solo las propiedades necesarias (telefono, email), 
 * React memo puede comparar valores primitivos o sub-objetos pequeños.
 */
export const ContactInfoInputs = memo(({ telefono, email, onChange, onBlur }) => {
    
    return (
        <>
            <Grid item xs={12} md={6}>
                <TextField
                    name="telefono"
                    label="Teléfono"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type="tel" // Mejor semántica para móviles y teclados numéricos
                    required={telefono.requerido}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={telefono.dato}
                    error={telefono.error}
                    helperText={telefono.error ? "Debe ingresar el teléfono" : ""}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    name="email"
                    label="Email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type="email"
                    required={email.requerido}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={email.dato}
                    error={email.error}
                    helperText={email.error ? "El formato es incorrecto o campo vacío" : ""}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
        </>
    );
});

ContactInfoInputs.displayName = "ContactInfoInputs";