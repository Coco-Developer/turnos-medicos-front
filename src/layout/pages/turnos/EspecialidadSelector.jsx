import {useEffect, useState} from "react";
import {listarEspecialidadesCubiertas} from "../../../services/especialidades.service";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import Grid from '@mui/material/Grid';

export const EspecialidadSelector = ({ especialidad, onChange }) => {
    const [especialidades, setEspecialidades] = useState([]);

    useEffect(() => {
        listarEspecialidadesCubiertas().then(setEspecialidades);
    }, []);

    return (
        <Grid size={{ xs: 12, md: 6 }}>
            <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel>Especialidad</InputLabel>
                <Select
                    name="especialidadid"
                    value={especialidad}
                    label="Especialidad"
                    onChange={onChange}
                    variant="outlined"
                >
                    <MenuItem value=""><em>Ninguna</em></MenuItem>
                    {especialidades.map(esp => (
                        <MenuItem key={esp.id} value={esp.id}>{esp.nombre}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>
    );
};