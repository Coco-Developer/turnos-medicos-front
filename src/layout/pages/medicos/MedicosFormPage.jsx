import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    Typography, Paper, Box, LinearProgress, Grid, 
    Divider, Container, Avatar, Stack, useTheme, Fade 
} from "@mui/material";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Iconografía
import BadgeIcon from '@mui/icons-material/Badge';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

// Componentes y Libs
import { obtenerMedico } from "../../../services/medicos.service";
import { PersonalInfoInputs } from "./PersonalInfoInputs";
import { ContactInfoInputs } from "./ContactInfoInputs";
import { IdentificationInput } from "./IdentificationInput";
import { EspecialidadSelector } from "./EspecialidadSelector";
import { SchedulePicker } from "./SchedulePicker";
import { JoinDatePicker } from "./JoinDatePicker";
import { FormActions } from "../../elements/FormActions";
import { SubmitForm } from "./FnGen";
import { FotoUploader } from "./FotoUploader";
import { getOnlyLettersEs, getOnlyNumbers } from "../../libs/Utils";
import { DAYS, DEFAULT_SCHEDULE_RANGE, NUM_DAYSMAP } from "../../libs/constants";
import { useSnack } from "../../context/SnackContext";

dayjs.extend(customParseFormat);

const MedicosFormPage = () => {
    const theme = useTheme();
    const { id } = useParams();
    const idMedicoMod = id ?? 0;
    const isEditing = Boolean(id);
    const navigate = useNavigate();
    const { setSnackData } = useSnack();

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    const defaultValues = useMemo(() => ({
        iniDte: dayjs(),
        iniTime: dayjs().hour(DEFAULT_SCHEDULE_RANGE.startHour).minute(0).second(0),
        endTime: dayjs().hour(DEFAULT_SCHEDULE_RANGE.endHour).minute(0).second(0),
    }), []);

    const [medico, setMedico] = useState({
        apellido: { campo: 'apellido', dato: '', requerido: true, error: false },
        nombre: { campo: 'nombre', dato: '', requerido: true, error: false },
        telefono: { campo: 'telefono', dato: '', requerido: true, error: false },
        direccion: { campo: 'direccion', dato: '', requerido: true, error: false },
        dni: { campo: 'dni', dato: '', requerido: true, error: false },
        especialidadid: { campo: 'especialidadid', dato: '', requerido: true, error: false },
        fechaaltalaboral: { campo: 'fechaaltalaboral', dato: defaultValues.iniDte, requerido: false, error: false },
        foto: { campo: 'foto', dato: '', requerido: false, error: false },
        matricula: { campo: 'matricula', dato: '', requerido: true, error: false },
        ...DAYS.reduce((acc, { key }) => ({
            ...acc,
            [`horarioatencion_${key}_inicio`]: { campo: `horarioatencion_${key}_inicio`, dato: isEditing ? null : defaultValues.iniTime, requerido: false, error: false },
            [`horarioatencion_${key}_fin`]: { campo: `horarioatencion_${key}_fin`, dato: isEditing ? null : defaultValues.endTime, requerido: false, error: false },
        }), {})
    });

    const cargarMedico = useCallback(async (id) => {
        setLoading(true);
        try {
            const r = await obtenerMedico(id);
            setMedico(prev => {
                // Clonación profunda para asegurar que React detecte el cambio de estado
                const nuevo = JSON.parse(JSON.stringify(prev));
                const parseHora = (h) => h ? dayjs(h, "HH:mm:ss") : null;

                nuevo.apellido.dato = r.apellido || '';
                nuevo.nombre.dato = r.nombre || '';
                nuevo.telefono.dato = r.telefono || '';
                nuevo.direccion.dato = r.direccion || '';
                nuevo.dni.dato = r.dni || '';
                nuevo.matricula.dato = r.matricula || '';
                nuevo.especialidadid.dato = r.especialidadId || '';
                // Corregimos la asignación de fecha (dayjs no se puede stringificar, se asigna directo)
                nuevo.fechaaltalaboral.dato = r.fechaAltaLaboral ? dayjs(r.fechaAltaLaboral) : defaultValues.iniDte;
                nuevo.foto.dato = r.foto || '';

                const horarios = Array.isArray(r.horarios) ? r.horarios : (Array.isArray(r.Horarios) ? r.Horarios : []);
                if (horarios.length > 0) {
                    horarios.forEach(h => {
                        const diaSemana = h.diaSemana ?? h.DiaSemana;
                        const horaInicio = h.horarioAtencionInicio ?? h.HorarioAtencionInicio;
                        const horaFin = h.horarioAtencionFin ?? h.HorarioAtencionFin;
                        const key = NUM_DAYSMAP[diaSemana];
                        if (key) {
                            nuevo[`horarioatencion_${key}_inicio`].dato = parseHora(horaInicio);
                            nuevo[`horarioatencion_${key}_fin`].dato = parseHora(horaFin);
                        }
                    });
                }
                return nuevo;
            });
        } catch (error) {
            setSnackData({ open: true, message: "Error al cargar datos", type: "error" });
        } finally {
            setLoading(false);
        }
    }, [defaultValues, setSnackData]);

    useEffect(() => {
        // Reiniciar el snackbar al entrar
        setSnackData({ open: false, message: '', type: 'info' });
        if (idMedicoMod !== 0) {
            cargarMedico(idMedicoMod);
        }
    }, [idMedicoMod, cargarMedico, setSnackData]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        let val = value;
        if (['telefono', 'dni'].includes(name)) val = getOnlyNumbers(value);
        if (['nombre', 'apellido'].includes(name)) val = getOnlyLettersEs(value);
        
        setMedico(prev => {
            if (prev[name]?.dato === val) return prev;
            return { ...prev, [name]: { ...prev[name], dato: val, error: false } };
        });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        SubmitForm(medico, setMedico, idMedicoMod, setSaving, defaultValues, navigate, setSnackData)(e);
    };

    const panelStyle = {
        p: 3, 
        borderRadius: 4, 
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: 'divider',
        height: 'fit-content' // Cambiado de 100% para que se ajuste al contenido
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Fade in={!loading} timeout={800}>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    
                    {/* --- HEADER --- */}
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                        <Avatar 
                            sx={{ 
                                width: 80, height: 80, 
                                bgcolor: theme.palette.primary.main,
                                boxShadow: theme.shadows[4]
                            }}
                        >
                            {medico.apellido.dato.charAt(0) || <BadgeIcon fontSize="large" />}
                        </Avatar>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                                {isEditing ? `Dr. ${medico.apellido.dato}, ${medico.nombre.dato}` : "Nuevo Registro Médico"}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                {isEditing ? `ID de Sistema: #${idMedicoMod}` : "Complete los campos para dar de alta al profesional"}
                            </Typography>
                        </Box>
                        {loading && <LinearProgress sx={{ width: '100%', mt: 2, borderRadius: 1 }} />}
                    </Box>

                    <Grid container spacing={3}>
                        
                        {/* --- COLUMNA IZQUIERDA --- */}
                        <Grid item xs={12} md={8}>
                            <Stack spacing={3}>
                                <Paper sx={panelStyle}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                        <BadgeIcon color="primary" />
                                        <Typography variant="h6" fontWeight={700}>Información Profesional</Typography>
                                    </Stack>
                                    <PersonalInfoInputs
                                        apellido={medico.apellido}
                                        nombre={medico.nombre}
                                        onChange={handleChange}
                                        setMedico={setMedico}
                                    />
                                    <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                                        <IdentificationInput
                                            dni={medico.dni}
                                            matricula={medico.matricula}
                                            onChange={handleChange}
                                            setMedico={setMedico}
                                        />
                                    </Box>
                                    <Box sx={{ mt: 3 }}>
                                        <EspecialidadSelector especialidadid={medico.especialidadid} onChange={handleChange} />
                                    </Box>
                                </Paper>

                                <Paper sx={panelStyle}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                        <ContactPhoneIcon color="primary" />
                                        <Typography variant="h6" fontWeight={700}>Medios de Contacto</Typography>
                                    </Stack>
                                    <ContactInfoInputs
                                        telefono={medico.telefono}
                                        direccion={medico.direccion}
                                        onChange={handleChange}
                                        setMedico={setMedico}
                                    />
                                </Paper>
                            </Stack>
                        </Grid>

                        {/* --- COLUMNA DERECHA (LA DE LA FOTO) --- */}
                        <Grid item xs={12} md={4}>
                            <Stack spacing={3}>
                                <Paper sx={{ ...panelStyle, textAlign: 'center' }}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3, justifyContent: 'center' }}>
                                        <CameraAltIcon color="primary" />
                                        <Typography variant="h6" fontWeight={700}>Fotografía</Typography>
                                    </Stack>
                                    
                                    {/* Contenedor SIN height fijo para que crezca con los botones */}
                                    <Box sx={{ width: '100%', mx: 'auto' }}>
                                        <FotoUploader foto={medico.foto} setMedico={setMedico} />
                                    </Box>

                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                                        Formatos soportados: JPG, PNG.
                                    </Typography>
                                </Paper>

                                <Paper sx={panelStyle}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                        <EventAvailableIcon color="primary" />
                                        <Typography variant="h6" fontWeight={700}>Estatus Laboral</Typography>
                                    </Stack>
                                    <JoinDatePicker fechaaltalaboral={medico.fechaaltalaboral} setMedico={setMedico} />
                                </Paper>
                            </Stack>
                        </Grid>

                        {/* --- HORARIOS --- */}
                        <Grid item xs={12}>
                            <Paper sx={{ ...panelStyle, borderLeft: `6px solid ${theme.palette.primary.main}`, width: '100%' }}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h5" fontWeight={800} gutterBottom>Disponibilidad</Typography>
                                </Box>
                                <Divider sx={{ mb: 4 }} />
                                <SchedulePicker medico={medico} setMedico={setMedico} defaultValues={defaultValues} />
                            </Paper>
                        </Grid>

                        {/* --- ACCIONES --- */}
                        <Grid item xs={12}>
                            <Box sx={{ 
                                display: 'flex', justifyContent: 'flex-end', p: 2, 
                                bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider'
                            }}>
                                <FormActions onSubmit={handleSubmit} loading={saving} />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Fade>
        </Container>
    );
};

export default MedicosFormPage;
