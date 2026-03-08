import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Paper, Grid, Box, Container, Avatar, Stack, Divider } from "@mui/material";
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

// Servicios y Lógica
import { obtenerEspecialidad } from "../../../services/especialidades.service";
import { NombreEspecialidadInput } from "./NombreEspecialidadInput";
import { FormActions } from "../../elements/FormActions";
import { SubmitForm } from "./FnGen";

const EspecialidadesFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const idEspecialidadMod = id === undefined ? 0 : id;
    const [saving, setSaving] = useState(false);

    const datosIniciales = useMemo(() => ({
        nombre: {
            campo: 'nombre',
            rotulo: 'Nombre de la Especialidad',
            dato: '',
            requerido: true,
            error: false
        },
    }), []);

    const [especialidad, setEspecialidad] = useState(datosIniciales);

    useEffect(() => {
        if (idEspecialidadMod !== 0) {
            obtenerEspecialidad(idEspecialidadMod).then((r) => {
                setEspecialidad({
                    nombre: {
                        ...datosIniciales.nombre,
                        dato: r.nombre,
                    }
                });
            });
        }
    }, [idEspecialidadMod, datosIniciales]);

    // HANDLERS
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEspecialidad(prev => ({
            ...prev,
            [name]: { ...prev[name], dato: value, error: false }
        }));
    };

    const handleSubmit = SubmitForm(especialidad, setEspecialidad, idEspecialidadMod, setSaving, navigate);

    // Estilo del panel (Igual al de Turnos)
    const panelStyle = {
        p: 3,
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper'
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                
                {/* Header Estilo Profesional */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 4 }}>
                    <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', boxShadow: 3 }}>
                        <MedicalServicesIcon fontSize="large" />
                    </Avatar>
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                        <Typography variant="h4" fontWeight={800} color="text.primary">
                            {idEspecialidadMod === 0 ? "Nueva Especialidad" : "Editar Especialidad"}
                        </Typography>
                        <Typography color="text.secondary">
                            Defina el nombre de la categoría médica para el sistema
                        </Typography>
                    </Box>
                </Stack>

                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12}>
                        <Paper sx={panelStyle}>
                            <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                Información General
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Box sx={{ width: '100%' }}>
                                <NombreEspecialidadInput
                                    especialidad={especialidad}
                                    onChange={handleChange}
                                />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Acciones del Formulario */}
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <FormActions
                        onSubmit={handleSubmit}
                        loading={saving}
                    />
                </Box>
            </Box>
        </Container>
    );
};

export default EspecialidadesFormPage;