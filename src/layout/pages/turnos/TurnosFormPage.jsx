import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Typography, LinearProgress, Paper, Grid, Box,
    Container, Avatar, Stack, Divider
} from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/es";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import AssignmentIcon from "@mui/icons-material/Assignment";

import { EspecialidadSelector } from "./EspecialidadSelector";
import { MedicoSelector } from "./MedicoSelector";
import { FechaHoraPicker } from "./FechaHoraPicker";
import { PacienteSelector } from "./PacienteSelector";
import { EstadoSelector } from "./EstadoSelector";
import { ObservacionesInput } from "./ObservacionesInput";
import { cargarTurno, SubmitForm } from "./FnGen";
import { useSnack } from "../../context/SnackContext";
import { FormActions } from "../../elements/FormActions";
import { listarTurnosDeMedico, listarTurnosDePaciente } from "../../../services/turnos.service";
import { obtenerHorarioMedico } from "../../../services/medicos.service";

const normalizeHHMM = (hora) => {
    if (!hora) return "";
    const clean = String(hora).trim();
    return clean.length >= 5 ? clean.substring(0, 5) : clean;
};

const TurnosFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const idTurnoMod = id ? Number(id) : 0;
    const { setSnackData } = useSnack();

    const [loading, setLoading] = useState(idTurnoMod !== 0);
    const [saving, setSaving] = useState(false);
    const [especialidad, setEspecialidad] = useState("");
    const [paciente, setPaciente] = useState({ id: null, nombre: "", apellido: "", dni: "" });
    const [fecha, setFecha] = useState(dayjs());
    const [horarioMedico, setHorarioMedico] = useState({ horaInicio: null, horaFin: null });
    const [horarioSemanal, setHorarioSemanal] = useState([]);
    const [doctorTurns, setDoctorTurns] = useState([]);
    const [patientTurns, setPatientTurns] = useState([]);

    const datosIniciales = useMemo(() => ({
        medicoid: { campo: "medicoid", dato: "", requerido: true, error: false },
        pacienteid: { campo: "pacienteid", dato: "", requerido: true, error: false },
        fecha: { campo: "fecha", dato: dayjs().toDate(), requerido: true, error: false },
        hora: { campo: "hora", dato: null, requerido: true, error: false },
        estadoid: { campo: "estadoid", dato: 1, requerido: true, error: false },
        observaciones: { campo: "observaciones", dato: "", requerido: false, error: false },
        dni: { campo: "dni", dato: "", requerido: true, error: false }
    }), []);

    const [turno, setTurno] = useState(datosIniciales);

    useEffect(() => {
        let mounted = true;
        setSnackData({ open: false });

        const load = async () => {
            if (idTurnoMod === 0) return;

            const data = await cargarTurno(idTurnoMod, datosIniciales);
            if (!mounted || !data) {
                setLoading(false);
                return;
            }

            setTurno(data.turno);
            setEspecialidad(data.especialidadId);
            setPaciente(data.paciente);
            setFecha(dayjs(data.turno.fecha.dato));
            setLoading(false);
        };

        load();

        return () => {
            mounted = false;
            setSnackData({ open: false });
        };
    }, [idTurnoMod, datosIniciales, setSnackData]);

    useEffect(() => {
        const medicoId = Number(turno.medicoid.dato);
        if (!medicoId) {
            setDoctorTurns([]);
            setHorarioSemanal([]);
            return;
        }

        listarTurnosDeMedico(medicoId).then((res) => {
            setDoctorTurns(Array.isArray(res) ? res : []);
        });
        obtenerHorarioMedico(medicoId).then((res) => {
            setHorarioSemanal(Array.isArray(res) ? res : []);
        });
    }, [turno.medicoid.dato]);

    useEffect(() => {
        const pacienteId = Number(turno.pacienteid.dato);
        if (!pacienteId) {
            setPatientTurns([]);
            return;
        }

        listarTurnosDePaciente(pacienteId).then((res) => {
            setPatientTurns(Array.isArray(res) ? res : []);
        });
    }, [turno.pacienteid.dato]);

    useEffect(() => {
        const selectedDate = dayjs(turno.fecha.dato || fecha);
        const dayIndex = selectedDate.day() === 0 ? 7 : selectedDate.day();
        const diaAgenda = horarioSemanal.find((d) => Number(d.diaSemana) === dayIndex);

        setHorarioMedico({
            horaInicio: diaAgenda?.horarioAtencionInicio || null,
            horaFin: diaAgenda?.horarioAtencionFin || null
        });
    }, [horarioSemanal, turno.fecha.dato, fecha]);

    const unavailableTimes = useMemo(() => {
        const selectedDate = dayjs(turno.fecha.dato || fecha).format("YYYY-MM-DD");
        const currentId = idTurnoMod || 0;

        const toBlocked = (arr) => arr
            .filter((t) => dayjs(t.fecha).format("YYYY-MM-DD") === selectedDate)
            .filter((t) => Number(t.id) !== currentId)
            .map((t) => normalizeHHMM(t.hora));

        const blocked = [...toBlocked(doctorTurns), ...toBlocked(patientTurns)].filter(Boolean);
        return Array.from(new Set(blocked));
    }, [doctorTurns, patientTurns, turno.fecha.dato, fecha, idTurnoMod]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setTurno((prev) => ({
            ...prev,
            [name]: { ...prev[name], dato: value, error: false }
        }));
    }, []);

    const handleEspecialidadChange = useCallback((e) => {
        const esp = e.target.value;
        setEspecialidad(esp);
        setHorarioMedico({ horaInicio: null, horaFin: null });
        setHorarioSemanal([]);
        setTurno((prev) => ({
            ...prev,
            medicoid: { ...prev.medicoid, dato: "", error: false },
            hora: { ...prev.hora, dato: null, error: false }
        }));
    }, []);

    const handleMedicoChange = useCallback((e, medicoSeleccionado) => {
        handleChange(e);
        setHorarioMedico({
            horaInicio: medicoSeleccionado?.horarioAtencionInicio || null,
            horaFin: medicoSeleccionado?.horarioAtencionFin || null
        });
        setTurno((prev) => ({
            ...prev,
            hora: { ...prev.hora, dato: null, error: false }
        }));
    }, [handleChange]);

    const handleFecChange = useCallback((dte) => {
        setFecha(dte);
        setTurno((prev) => ({
            ...prev,
            fecha: { ...prev.fecha, dato: dte?.toDate() || null, error: false },
            hora: { ...prev.hora, dato: null, error: false }
        }));
    }, []);

    const handleTimeAccept = useCallback((tme, name = "hora") => {
        setTurno((prev) => ({
            ...prev,
            [name]: {
                ...prev[name],
                dato: tme ? dayjs(tme).toDate() : null,
                error: false
            }
        }));
    }, []);

    const validateTurnoData = useCallback(() => {
        if (!especialidad) return "Debe seleccionar una especialidad.";
        if (!turno.medicoid.dato) return "Debe seleccionar un medico.";
        if (!turno.pacienteid.dato) return "Debe seleccionar un paciente.";
        if (!turno.hora.dato) return "Debe seleccionar un horario.";

        const selected = dayjs(turno.hora.dato).format("HH:mm");
        if (unavailableTimes.includes(selected)) {
            return "Ese horario no esta disponible para el medico o el paciente.";
        }

        if (horarioMedico?.horaInicio && horarioMedico?.horaFin) {
            const ini = normalizeHHMM(horarioMedico.horaInicio);
            const fin = normalizeHHMM(horarioMedico.horaFin);
            if (selected < ini || selected > fin) {
                return `La hora debe estar dentro del horario del medico (${ini} a ${fin}).`;
            }
        }

        const selectedDate = dayjs(turno.fecha.dato || fecha);
        const dayIndex = selectedDate.day() === 0 ? 7 : selectedDate.day();
        const diaAgenda = horarioSemanal.find((d) => Number(d.diaSemana) === dayIndex);
        if (!diaAgenda?.horarioAtencionInicio || !diaAgenda?.horarioAtencionFin) {
            return "El medico no atiende ese dia.";
        }

        return "";
    }, [especialidad, turno, unavailableTimes, horarioMedico, horarioSemanal, fecha]);

    const onSubmit = SubmitForm(
        turno,
        setTurno,
        handleFecChange,
        dayjs(),
        idTurnoMod,
        setSaving,
        setSnackData,
        validateTurnoData
    );

    const panelStyle = {
        p: 3,
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        border: "1px solid",
        borderColor: "divider"
    };

    if (loading) return <LinearProgress />;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box component="form" onSubmit={onSubmit} noValidate>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ mb: 4 }}>
                    <Avatar sx={{ width: 60, height: 60, bgcolor: "primary.main", boxShadow: 3 }}>
                        <CalendarMonthIcon fontSize="large" />
                    </Avatar>
                    <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                        <Typography variant="h4" fontWeight={800} color="text.primary">
                            {idTurnoMod ? "Editando Turno" : "Nuevo Turno"}
                        </Typography>
                        <Typography color="text.secondary">
                            {idTurnoMod ? `Paciente: ${paciente.nombre || ""}` : "Complete los datos para agendar la cita"}
                        </Typography>
                    </Box>
                </Stack>

                <Grid container spacing={4}>
                    <Grid item xs={12} lg={5}>
                        <Stack spacing={3}>
                            <Paper sx={panelStyle}>
                                <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <MedicalServicesIcon fontSize="small" /> Informacion Medica
                                </Typography>
                                <Divider sx={{ mb: 1 }} />

                                <EspecialidadSelector especialidad={especialidad} onChange={handleEspecialidadChange} />

                                <MedicoSelector
                                    medico={turno.medicoid.dato}
                                    turno={turno}
                                    especialidad={especialidad}
                                    selectedDate={turno.fecha.dato || fecha}
                                    onChange={handleMedicoChange}
                                />
                            </Paper>

                            <Paper sx={panelStyle}>
                                <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <PersonIcon fontSize="small" /> Informacion del Paciente
                                </Typography>
                                <Divider sx={{ mb: 1 }} />
                                <PacienteSelector
                                    turno={turno}
                                    paciente={paciente}
                                    onSelect={(val) => {
                                        setTurno((prev) => ({
                                            ...prev,
                                            dni: { ...prev.dni, dato: val.dni || "", error: false },
                                            pacienteid: { ...prev.pacienteid, dato: val.id || "", error: false },
                                            hora: { ...prev.hora, dato: null, error: false }
                                        }));
                                        setPaciente(val);
                                    }}
                                />
                            </Paper>

                            <Paper sx={panelStyle}>
                                <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <AssignmentIcon fontSize="small" /> Detalles Adicionales
                                </Typography>
                                <Divider sx={{ mb: 1 }} />
                                <EstadoSelector turno={turno} onChange={handleChange} />
                                <ObservacionesInput turno={turno} onChange={handleChange} />
                            </Paper>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} lg={7}>
                        <Paper sx={{ ...panelStyle, p: 0, overflow: "hidden" }}>
                            <Box sx={{ p: 2.5, bgcolor: "primary.main", color: "white" }}>
                                <Typography variant="h6" fontWeight={600}>Programacion de Cita</Typography>
                                {horarioMedico.horaInicio && (
                                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                        Horario del medico: {horarioMedico.horaInicio.substring(0, 5)} a {horarioMedico.horaFin.substring(0, 5)} hs
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ p: 2 }}>
                                <FechaHoraPicker
                                    turno={turno}
                                    fecha={fecha}
                                    horarioMedico={horarioMedico}
                                    horarioSemanal={horarioSemanal}
                                    unavailableTimes={unavailableTimes}
                                    disabled={!turno.medicoid.dato}
                                    onChangeDate={handleFecChange}
                                    onChangeTime={handleTimeAccept}
                                />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                <Paper
                    elevation={0}
                    sx={{
                        mt: 4, p: 2,
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 2,
                        bgcolor: "background.default",
                        borderTop: "1px solid",
                        borderColor: "divider"
                    }}
                >
                    <FormActions onSubmit={onSubmit} loading={saving} />
                </Paper>
            </Box>
        </Container>
    );
};

export default TurnosFormPage;
