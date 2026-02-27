import React, { memo } from "react";
import Grid from '@mui/material/Grid';
import { TextField } from "@mui/material";
import { handleValidation } from "./FnGen";

export const ContactInfoInputs = memo(({ telefono, direccion, setMedico, onChange }) => {
    
    // Cambiamos la salvaguarda: si no hay objetos, no renderizamos nada para evitar crash
    if (!telefono || !direccion) return null;

    // Función interna para evitar repetir código y asegurar que setMedico exista
    const validate = (e) => {
        if (typeof setMedico === "function") {
            handleValidation({ telefono, direccion }, setMedico)(e);
        } else {
            console.warn("setMedico no fue provisto a ContactInfoInputs");
        }
    };

    return (
        <>
            <Grid item xs={12} md={6}>
                <TextField
                    name={telefono.campo || "telefono"}
                    label="Teléfono"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={telefono.requerido}
                    onChange={onChange}
                    onBlur={validate} // Usamos la función segura
                    onKeyUp={(event) => {
                        // Permitir solo números
                        if (!/[0-9]/.test(event.key) && event.key !== "Backspace" && event.key !== "Tab") {
                            event.preventDefault();
                        }
                    }}
                    value={telefono.dato || ""}
                    error={!!telefono.error}
                    helperText={telefono.error ? "Debe ingresar el teléfono" : ""}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    name={direccion.campo || "direccion"}
                    label="Dirección"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={direccion.requerido}
                    onChange={onChange}
                    onBlur={validate} // Usamos la función segura
                    value={direccion.dato || ""}
                    error={!!direccion.error}
                    helperText={direccion.error ? "Debe ingresar la dirección" : ""}
                />
            </Grid>
        </>
    );
});

ContactInfoInputs.displayName = "ContactInfoInputs";