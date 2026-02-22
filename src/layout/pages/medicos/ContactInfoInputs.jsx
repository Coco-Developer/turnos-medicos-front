import React from "react";
import Grid from '@mui/material/Grid';
import { TextField } from "@mui/material";
import {handleValidation} from "./FnGen";

export const ContactInfoInputs = ({ medico, setMedico, onChange }) => {
    return (
        <>
            <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                    name={medico.telefono.campo}
                    label="Teléfono"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={medico.telefono.requerido}
                    onChange={onChange}
                    onBlur={handleValidation(medico, setMedico)}
                    onKeyUp={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                            event.preventDefault();
                        }
                    }}
                    value={medico.telefono.dato}
                    error={medico.telefono.error}
                    helperText={medico.telefono.error ? "Debe ingresar el teléfono" : ""}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                    name={medico.direccion.campo}
                    label="Dirección"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={medico.direccion.requerido}
                    onChange={onChange}
                    onBlur={handleValidation(medico, setMedico)}
                    value={medico.direccion.dato}
                    error={medico.direccion.error}
                    helperText={medico.direccion.error ? "Debe ingresar la dirección" : ""}
                />
            </Grid>
        </>
    );
};