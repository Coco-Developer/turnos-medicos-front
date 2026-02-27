import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    Typography, Paper, Box, LinearProgress, Grid, 
    Container, Avatar, Stack, useTheme 
} from "@mui/material";
import dayjs from "dayjs";

// Iconografía
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import PersonIcon from '@mui/icons-material/Person';

// Componentes y Libs
import { obtenerPaciente } from "../../../services/pacientes.service";
import { PersonalInfoInputs } from "./PersonalInfoInputs";
import { ContactInfoInputs } from "./ContactInfoInputs";
import { IdentificationInput } from "./IdentificationInput";
import { PasswordInput } from "./PasswordInput";
import { BirthDatePicker } from "./BirthDatePicker";
import { FormActions } from "../../elements/FormActions";
import { SubmitForm, handleValidation } from "./FnGen";
import { getOnlyLettersEs, getOnlyNumbers } from "../../libs/Utils";
import { useSnack } from "../../context/SnackContext";

const PacientesFormPage = () => {
    const theme = useTheme();
    const { id } = useParams();
    const idPacienteMod = id ?? 0;
    const isEditing = Boolean(id);
    const navigate = useNavigate();
    const { setSnackData } = useSnack();

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    // ESTADO PLANO (Optimizado para evitar delay de renderizado)
    const [paciente, setPaciente] = useState({
        apellido: { campo: 'apellido', dato: '', requerido: true, error: false },
        nombre: { campo: 'nombre', dato: '', requerido: true, error: false },
        telefono: { campo: 'telefono', dato: '', requerido: true, error: false },
        email: { campo: 'email', dato: '', requerido: true, error: false },
        dni: { campo: 'dni', dato: '', requerido: true, error: false },
        password: { campo: 'password', dato: '', requerido: !isEditing, error: false },
        fechanacimiento: { campo: 'fechanacimiento', dato: null, requerido: true, error: false },
    });

    const cargarPaciente = useCallback(async (id) => {
        setLoading(true);
        try {
            const r = await obtenerPaciente(id);
            setPaciente(prev => ({
                ...prev,
                apellido: { ...prev.apellido, dato: r.apellido || '' },
                nombre: { ...prev.nombre, dato: r.nombre || '' },
                telefono: { ...prev.telefono, dato: r.telefono || '' },
                email: { ...prev.email, dato: r.email || '' },
                dni: { ...prev.dni, dato: r.dni || '' },
                fechanacimiento: { ...prev.fechanacimiento, dato: r.fechaNacimiento ? dayjs(r.fechaNacimiento) : null },
                password: { ...prev.password, dato: '', requerido: false },
            }));
        } catch (error) {
            setSnackData({ open: true, message: "Error al cargar datos del paciente", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [setSnackData]);

    useEffect(() => {
        if (idPacienteMod !== 0) cargarPaciente(idPacienteMod);
    }, [idPacienteMod, cargarPaciente]);

    // MANEJADOR ULTRA RÁPIDO
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        let val = value;
        if (['telefono', 'dni'].includes(name)) val = getOnlyNumbers(value);
        if (['nombre', 'apellido'].includes(name)) val = getOnlyLettersEs(value);
        
        setPaciente(prev => ({
            ...prev,
            [name]: { ...prev[name], dato: val, error: false }
        }));
    }, []);

    // Validación al perder el foco (dispara la lógica de FnGen)
    const handleBlur = (e) => {
        handleValidation(paciente, setPaciente, e);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        SubmitForm(paciente, setPaciente, idPacienteMod, setSaving, setSnackData, navigate)(e);
    };

    const panelStyle = {
        p: 3, borderRadius: 4, bgcolor: 'background.paper',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid', borderColor: 'divider',
        height: '100%'
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                
                {/* HEADER DINÁMICO */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar 
                        sx={{ 
                            width: 80, height: 80, 
                            bgcolor: isEditing ? theme.palette.success.main : theme.palette.primary.main,
                            fontSize: '2rem', fontWeight: 900,
                            boxShadow: theme.shadows[3],
                            border: `3px solid ${theme.palette.background.paper}`
                        }}
                    >
                        {paciente.apellido.dato?.charAt(0) || <PersonIcon fontSize="large" />}
                    </Avatar>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                            {isEditing ? `${paciente.apellido.dato.toUpperCase()}, ${paciente.nombre.dato}` : "Nuevo Paciente"}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {isEditing ? `Editando registro ID: ${idPacienteMod}` : "Complete los datos para el alta"}
                        </Typography>
                    </Box>
                </Box>

                {loading && <LinearProgress sx={{ mb: 4, borderRadius: 2 }} />}

                <Grid container spacing={3}>
                    {/* Columna Izquierda: Datos Personales y Seguridad */}
                    <Grid item xs={12} md={8}>
                        <Stack spacing={3}>
                            <Paper sx={panelStyle}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                    <AccountBoxIcon color="primary" />
                                    <Typography variant="h6" fontWeight={700}>Información Personal</Typography>
                                </Stack>
                                <PersonalInfoInputs 
                                    apellido={paciente.apellido} 
                                    nombre={paciente.nombre} 
                                    onChange={handleChange} 
                                    onBlur={handleBlur} 
                                />
                                <Box sx={{ mt: 3 }}>
                                    <Grid container spacing={2}>
                                        <IdentificationInput 
                                            dni={paciente.dni} 
                                            onChange={handleChange} 
                                            onBlur={handleBlur} 
                                        />
                                        <BirthDatePicker 
                                            fechanacimiento={paciente.fechanacimiento} 
                                            setPaciente={setPaciente} 
                                        />
                                    </Grid>
                                </Box>
                            </Paper>

                            <Paper sx={panelStyle}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                    <FingerprintIcon color="primary" />
                                    <Typography variant="h6" fontWeight={700}>Seguridad de Acceso</Typography>
                                </Stack>
                                <PasswordInput 
                                    password={paciente.password} 
                                    onChange={handleChange} 
                                    onBlur={handleBlur} 
                                />
                            </Paper>
                        </Stack>
                    </Grid>

                    {/* Columna Derecha: Contacto */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={panelStyle}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                <ContactPhoneIcon color="primary" />
                                <Typography variant="h6" fontWeight={700}>Datos de Contacto</Typography>
                            </Stack>
                            <ContactInfoInputs 
                                telefono={paciente.telefono} 
                                email={paciente.email} 
                                onChange={handleChange} 
                                onBlur={handleBlur} 
                            />
                        </Paper>
                    </Grid>

                    {/* Barra de Acciones Final */}
                    <Grid item xs={12}>
                        <Paper 
                            elevation={0}
                            sx={{ 
                                display: 'flex', justifyContent: 'flex-end', p: 2, mt: 1,
                                bgcolor: '#fcfcfc', borderRadius: 3, border: '1px solid', borderColor: 'divider' 
                            }}
                        >
                            <FormActions loading={saving} />
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default PacientesFormPage;