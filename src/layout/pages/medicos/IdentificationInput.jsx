import React from "react";
import Grid from '@mui/material/Grid';
import { TextField } from "@mui/material";
import {handleValidation} from "./FnGen";

export const IdentificationInput = ({ medico, setMedico, onChange }) => {
    return (
        <>
            <Grid>
                <TextField
                    name={medico.dni.campo}
                    label="DNI"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={medico.dni.requerido}
                    onChange={onChange}
                    onBlur={handleValidation(medico, setMedico)}
                    value={medico.dni.dato}
                    error={medico.dni.error}
                    helperText={medico.dni.error ? "Debe ingresar el número de documento" : ""}
                />
            </Grid>
            <Grid>
                <TextField
                    name={medico.matricula.campo}
                    label="Matrícula"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={medico.matricula.requerido}
                    onChange={onChange}
                    onBlur={handleValidation(medico, setMedico)}
                    value={medico.matricula.dato}
                    error={medico.matricula.error}
                    helperText={medico.matricula.error ? "Debe ingresar la matrícula" : ""}
                />
            </Grid>
        </>
    );
};