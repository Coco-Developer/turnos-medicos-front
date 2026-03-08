import React from "react";
import { FormControl, InputLabel, Select, MenuItem, Box, ListItemIcon, Typography } from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';

export const EstadoSelector = ({ turno, onChange }) => {
    // Definimos los estados posibles (esto podría venir de una API)
    const estados = [
        { id: 1, nombre: "Pendiente", color: "#ffc107" },
        { id: 2, nombre: "Confirmado", color: "#4caf50" },
        { id: 3, nombre: "Cancelado", color: "#f44336" },
        { id: 4, nombre: "Ausente", color: "#9e9e9e" }
    ];

    return (
        <Box sx={{ width: '100%' }}>
            <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel id="estado-label">Estado del Turno</InputLabel>
                <Select
                    labelId="estado-label"
                    id={turno.estadoid.campo}
                    name={turno.estadoid.campo}
                    value={turno.estadoid.dato}
                    label="Estado del Turno"
                    onChange={onChange}
                >
                    {estados.map((est) => (
                        <MenuItem key={est.id} value={est.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ListItemIcon sx={{ minWidth: 30 }}>
                                    <CircleIcon sx={{ fontSize: 14, color: est.color }} />
                                </ListItemIcon>
                                <Typography variant="body2">{est.nombre}</Typography>
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};