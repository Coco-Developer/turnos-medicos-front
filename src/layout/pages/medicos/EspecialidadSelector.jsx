import React, { useState, useEffect } from "react";
import Grid from '@mui/material/Grid';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";
import { listarEspecialidades } from "../../../services/especialidades.service";

export const EspecialidadSelector = ({ medico, setMedico, onChange }) => {
    const [especialidades, setEspecialidades] = useState([]);

    useEffect(() => {
        listarEspecialidades().then(setEspecialidades);
    }, []);

    return (
        <Grid size={{ xs: 12, md: 6 }}>
            <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel error={medico.especialidadid.error}>Especialidad</InputLabel>
                <Select
                    labelId="select-label"
                    id={medico.especialidadid.campo}
                    name={medico.especialidadid.campo}
                    value={medico.especialidadid.dato}
                    error={medico.especialidadid.error}
                    label="Especialidad"
                    onChange={onChange}
                    variant="outlined"
                >
                    <MenuItem value=""><em>Ninguna</em></MenuItem>
                    {especialidades.map(esp => (
                        <MenuItem key={esp.id} name={medico.especialidadid.campo} value={esp.id}>
                            {esp.nombre}
                        </MenuItem>
                    ))}
                </Select>
                {medico.especialidadid.error && (
                    <FormHelperText error>Debe seleccionar la especialidad</FormHelperText>
                )}
            </FormControl>
        </Grid>
    );
};