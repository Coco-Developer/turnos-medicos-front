import * as React from "react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { listarMedicosPorEspecialidad, obtenerHorarioMedico } from "../../../services/medicos.service";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, Box, Typography, Stack } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const getScheduleLabel = (schedule, selectedDate) => {
    if (!Array.isArray(schedule) || schedule.length === 0 || !selectedDate) return null;
    const d = dayjs(selectedDate);
    if (!d.isValid()) return null;
    const dayIndex = d.day() === 0 ? 7 : d.day();
    const dia = schedule.find((x) => Number(x.diaSemana) === dayIndex);
    if (!dia?.horarioAtencionInicio || !dia?.horarioAtencionFin) return "No atiende este dia";
    return `${dia.horarioAtencionInicio.substring(0, 5)} - ${dia.horarioAtencionFin.substring(0, 5)}`;
};

export const MedicoSelector = ({ turno, especialidad, selectedDate, onChange }) => {
    const [medicos, setMedicos] = useState([]);
    const [schedulesByMedico, setSchedulesByMedico] = useState({});

    useEffect(() => {
        if (Number(especialidad) > 0) {
            listarMedicosPorEspecialidad(especialidad).then((res) => {
                setMedicos(Array.isArray(res) ? res : []);
            });
        } else {
            setMedicos([]);
            setSchedulesByMedico({});
        }
    }, [especialidad]);

    useEffect(() => {
        let cancelled = false;
        if (!Array.isArray(medicos) || medicos.length === 0) return;

        const loadSchedules = async () => {
            const next = {};
            await Promise.all(
                medicos.map(async (m) => {
                    const schedule = await obtenerHorarioMedico(m.id);
                    next[m.id] = Array.isArray(schedule) ? schedule : [];
                })
            );
            if (!cancelled) setSchedulesByMedico(next);
        };

        loadSchedules();
        return () => {
            cancelled = true;
        };
    }, [medicos]);

    return (
        <Box sx={{ width: "100%" }}>
            <FormControl
                variant="outlined"
                fullWidth
                margin="normal"
                error={turno.medicoid.error}
                disabled={!especialidad}
            >
                <InputLabel id="medico-select-label">Medico *</InputLabel>
                <Select
                    labelId="medico-select-label"
                    value={turno.medicoid.dato}
                    label="Medico *"
                    onChange={(e) => {
                        const medicoSeleccionado = medicos.find((m) => m.id === e.target.value) || null;
                        onChange(e, medicoSeleccionado);
                    }}
                    name={turno.medicoid.campo}
                    sx={{
                        "& .MuiSelect-select": {
                            display: "flex",
                            alignItems: "center",
                            whiteSpace: "normal",
                            minHeight: "1.5em"
                        }
                    }}
                >
                    <MenuItem value="">
                        <Typography color="text.secondary" variant="body2">
                            -- Seleccione un Medico --
                        </Typography>
                    </MenuItem>

                    {medicos.map((med) => {
                        const label = getScheduleLabel(schedulesByMedico[med.id], selectedDate)
                            || (med.horarioAtencionInicio
                                ? `${med.horarioAtencionInicio.substring(0, 5)} - ${med.horarioAtencionFin.substring(0, 5)}`
                                : "Sin agenda");
                        return (
                        <MenuItem key={med.id} value={med.id}>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ width: "100%" }}>
                                <Typography sx={{ fontWeight: 500 }}>
                                    {med.apellido?.toUpperCase()}, {med.nombre}
                                </Typography>

                                {label && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                            bgcolor: "action.hover",
                                            px: 1,
                                            borderRadius: 1
                                        }}
                                    >
                                        <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {label}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </MenuItem>
                    )})}
                </Select>
                {turno.medicoid.error && (
                    <FormHelperText>Debe seleccionar un medico de la lista</FormHelperText>
                )}
            </FormControl>
        </Box>
    );
};
