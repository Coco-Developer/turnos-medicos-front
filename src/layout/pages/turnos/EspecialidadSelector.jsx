import { useEffect, useState } from "react";
import { listarEspecialidadesCubiertas } from "../../../services/especialidades.service";
import { FormControl, InputLabel, MenuItem, Select, Box } from "@mui/material";

export const EspecialidadSelector = ({ especialidad, onChange }) => {
    const [especialidades, setEspecialidades] = useState([]);

    useEffect(() => {
        listarEspecialidadesCubiertas().then((res) => {
            setEspecialidades(Array.isArray(res) ? res : []);
        });
    }, []);

    return (
        /* Eliminamos el <Grid>. Usamos un Box al 100% */
        <Box sx={{ width: '100%' }}>
            <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel id="label-especialidad">Especialidad</InputLabel>
                <Select
                    labelId="label-especialidad"
                    name="especialidadid"
                    value={especialidad}
                    label="Especialidad"
                    onChange={onChange}
                >
                    <MenuItem value=""><em>Ninguna</em></MenuItem>
                    {especialidades.map(esp => (
                        <MenuItem key={esp.id} value={esp.id}>{esp.nombre}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};
