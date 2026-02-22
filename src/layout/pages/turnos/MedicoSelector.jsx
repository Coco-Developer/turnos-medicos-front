import * as React from "react";
import {useEffect, useState} from "react";
import dayjs from "dayjs";
import 'dayjs/locale/es';
import {listarMedicosPorEspecialidad} from "../../../services/medicos.service";
import {FormControl, FormHelperText, InputLabel, MenuItem, Select} from "@mui/material";
import Grid from '@mui/material/Grid';

export const MedicoSelector = ({ turno, especialidad, onChange }) => {
    const [medicos, setMedicos] = useState([]);
    const [medicoHor, setMedicoHor] = useState({
        minTime: dayjs().hour(8).minute(0).second(0),
        maxTime: dayjs().hour(20).minute(0).second(0)
    });

    useEffect(() => {
        if (especialidad > 0) {
            listarMedicosPorEspecialidad(especialidad).then(setMedicos);
        }
    }, [especialidad]);

    return (
        <Grid size={{ xs: 12, md: 6 }}>
            <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel error={turno.medicoid.error}>Médico *</InputLabel>
                <Select
                    value={turno.medicoid.dato}
                    error={turno.medicoid.error}
                    label="Médico *"
                    onChange={onChange}
                    variant="outlined"
                    name={turno.medicoid.campo}
                >
                    <MenuItem value=""><em>-- Seleccione un Médico --</em></MenuItem>
                    {medicos.map(med => (
                        <MenuItem
                            key={med.id}
                            value={med.id}
                            data-ini={med.horarioAtencionInicio}
                            data-fin={med.horarioAtencionFin}
                        >
                            {med.apellido}, {med.nombre}
                        </MenuItem>
                    ))}
                </Select>
                {turno.medicoid.error && (
                    <FormHelperText error>Debe seleccionar el médico</FormHelperText>
                )}
            </FormControl>
        </Grid>
    );
};