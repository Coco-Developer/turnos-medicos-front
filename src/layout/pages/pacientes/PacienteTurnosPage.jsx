import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
    Typography, Box, useTheme, LinearProgress, 
    Paper, Grid, Avatar, Stack, Divider, Chip
} from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEnvelope, faIdCard, faPhone, 
    faUser, faCalendarCheck 
} from "@fortawesome/free-solid-svg-icons";

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import dayjs from "dayjs";

// Services
import { listarTurnosPaciente } from "../../../services/turnos.service";
import { obtenerPaciente } from "../../../services/pacientes.service";

const normalizeTurno = (t) => ({
    id: t.id ?? t.turnoId ?? t.Id ?? `${t.fecha ?? t.fecha_turno ?? "s/f"}-${t.hora ?? t.hora_turno ?? "s/h"}-${t.medico ?? t.medicoNombre ?? "s/m"}`,
    fecha: t.fecha ?? t.fechaTurno ?? t.fecha_turno ?? null,
    hora: t.hora ?? t.horaTurno ?? t.hora_turno ?? "",
    medico: t.medico ?? t.medicoNombre ?? t.nombreMedico ?? t.doctor ?? "-",
    foto: t.foto ?? t.Foto ?? t.medicoFoto ?? t.fotoMedico ?? "",
    especialidad: t.especialidad ?? t.especialidadNombre ?? t.nombreEspecialidad ?? "-",
    estado: t.estado ?? t.estadoNombre ?? "-",
    estadoClase: t.estadoClase ?? t.estado_clase ?? "",
    estadoIcono: t.estadoIcono ?? t.estado_icono ?? null,
    observaciones: t.observaciones ?? t.obs ?? ""
});

const PacienteTurnosPage = () => {
    const { id } = useParams();
    const theme = useTheme();
    
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paciente, setPaciente] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // Cargamos ambos datos en paralelo para ganar velocidad
            const [turnosRes, pacienteRes] = await Promise.all([
                listarTurnosPaciente(id),
                obtenerPaciente(id)
            ]);

            const safeTurnos = Array.isArray(turnosRes) ? turnosRes.map(normalizeTurno) : [];
            setData(safeTurnos);

            // Formateo de DNI para la vista
            const dniFormateado = pacienteRes?.dni
                ? new Intl.NumberFormat("es-ES").format(pacienteRes.dni)
                : "-";

            setPaciente({
                nombreCompleto: `${pacienteRes?.apellido ?? ""}, ${pacienteRes?.nombre ?? ""}`,
                inicial: (pacienteRes?.apellido?.charAt(0) || "P"),
                dni: dniFormateado,
                telefono: pacienteRes?.telefono ?? "-",
                email: pacienteRes?.email ?? "-",
            });
        } catch (error) {
            console.error("Error cargando datos del paciente", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const columns = useMemo(() => [
        {
            accessorKey: 'fecha',
            header: 'Fecha',
            size: 100,
            Cell: ({ cell }) => (
                <Typography variant="body2" fontWeight={700}>
                    {dayjs(cell.getValue()).format('DD/MM/YYYY')}
                </Typography>
            ),
        },
        {
            accessorKey: 'hora',
            header: 'Hora',
            size: 80,
            Cell: ({ cell }) => <Chip label={cell.getValue()} size="small" variant="outlined" />
        },
        {
            accessorKey: 'medico',
            header: 'Médico',
            size: 250,
            Cell: ({ renderedCellValue, row }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        src={row.original.foto ? `data:image/jpeg;base64,${row.original.foto}` : ""}
                        sx={{ width: 32, height: 32, border: `1px solid ${theme.palette.divider}` }}
                    >
                        {(renderedCellValue || "-").toString().charAt(0)}
                    </Avatar>
                    <Typography variant="body2">{renderedCellValue}</Typography>
                </Box>
            ),
        },
        {
            accessorKey: 'especialidad',
            header: 'Especialidad',
            size: 150,
        },
        {
            accessorKey: 'estado',
            header: 'Estado',
            size: 120,
            Cell: ({ cell, row }) => (
                <Box sx={{ 
                    display: 'flex', alignItems: 'center', gap: 1,
                    px: 1.5, py: 0.5, borderRadius: '20px', width: 'fit-content'
                }} className={row.original.estadoClase}>
                    <FontAwesomeIcon icon={row.original.estadoIcono} />
                    <Typography variant="caption" fontWeight={700}>
                        {cell.getValue().toUpperCase()}
                    </Typography>
                </Box>
            ),
        },
        {
            accessorKey: 'observaciones',
            header: 'Observaciones',
            size: 200,
        },
    ], [theme]);

    const table = useMaterialReactTable({
        columns,
        data,
        enableHiding: false,
        localization: MRT_Localization_ES,
        muiTablePaperProps: {
            elevation: 0,
            sx: { borderRadius: '16px', border: '1px solid', borderColor: 'divider' },
        },
        initialState: { 
            pagination: { pageSize: 10 },
            sorting: [{ id: 'fecha', desc: true }] 
        },
    });

    return (
        <Box sx={{ p: 3 }}>
            {/* --- CABECERA DE PERFIL --- */}
            {paciente && (
                <Paper sx={{ p: 3, mb: 4, borderRadius: 4, bgcolor: 'background.paper', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item>
                            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem', fontWeight: 800 }}>
                                {paciente.inicial}
                            </Avatar>
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h4" fontWeight={900} color="text.primary">
                                {paciente.nombreCompleto}
                            </Typography>
                            <Stack direction="row" spacing={3} sx={{ mt: 1 }} divider={<Divider orientation="vertical" flexItem />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FontAwesomeIcon icon={faIdCard} color={theme.palette.text.secondary} />
                                    <Typography variant="body2">{paciente.dni}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FontAwesomeIcon icon={faPhone} color={theme.palette.text.secondary} />
                                    <Typography variant="body2">{paciente.telefono}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FontAwesomeIcon icon={faEnvelope} color={theme.palette.text.secondary} />
                                    <Typography variant="body2">{paciente.email}</Typography>
                                </Box>
                            </Stack>
                        </Grid>
                        <Grid item>
                             <Chip 
                                icon={<FontAwesomeIcon icon={faCalendarCheck} />} 
                                label={`${data.length} Turnos registrados`} 
                                color="primary" variant="outlined" sx={{ fontWeight: 700 }}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}

            {/* --- TABLA DE TURNOS --- */}
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                Historial de Citas
            </Typography>
            
            <MaterialReactTable table={table} />
        </Box>
    );
};

export default PacienteTurnosPage;
