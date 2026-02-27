import React, { useState, useEffect, memo } from "react";
import Grid from '@mui/material/Grid';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";
import { listarEspecialidades } from "../../../services/especialidades.service";

// Usamos memo y recibimos solo la propiedad específica 'especialidadid'
export const EspecialidadSelector = memo(({ especialidadid, onChange }) => {
    const [especialidades, setEspecialidades] = useState([]);

    useEffect(() => {
        // Cargamos las especialidades una sola vez al montar el componente
        listarEspecialidades().then(setEspecialidades);
    }, []);

    return (
        <Grid size={{ xs: 12, md: 6 }}>
            <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel error={especialidadid.error}>Especialidad</InputLabel>
                <Select
                    labelId="select-label"
                    id={especialidadid.campo}
                    name={especialidadid.campo}
                    value={especialidadid.dato}
                    error={especialidadid.error}
                    label="Especialidad"
                    onChange={onChange}
                    variant="outlined"
                >
                    <MenuItem value=""><em>Ninguna</em></MenuItem>
                    {especialidades.map(esp => (
                        <MenuItem key={esp.id} value={esp.id}>
                            {esp.nombre}
                        </MenuItem>
                    ))}
                </Select>
                {especialidadid.error && (
                    <FormHelperText error>Debe seleccionar la especialidad</FormHelperText>
                )}
            </FormControl>
        </Grid>
    );
});

EspecialidadSelector.displayName = "EspecialidadSelector";