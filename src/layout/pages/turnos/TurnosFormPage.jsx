import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Typography, LinearProgress, Paper, Grid, Box } from "@mui/material";
import dayjs from "dayjs";
import 'dayjs/locale/es';

// Servicios
import { listarEspecialidadesCubiertas } from "../../../services/especialidades.service";
import { listarEstados } from "../../../services/estados.service";
import { listarTurnosPorMedico } from "../../../services/turnos.service";
import { listarMedicosPorEspecialidad, obtenerHorarioMedico } from "../../../services/medicos.service";
import { listarPacientes } from "../../../services/pacientes.service";

// Componentes locales
import { EspecialidadSelector } from "./EspecialidadSelector";
import { MedicoSelector } from "./MedicoSelector";
import { FechaHoraPicker } from "./FechaHoraPicker";
import { PacienteSelector } from "./PacienteSelector";
import { EstadoSelector } from "./EstadoSelector";
import { ObservacionesInput } from "./ObservacionesInput";
import { cargarTurno, SubmitForm } from "./FnGen";

// Contexto y Elementos
import { useSnack } from "../../context/SnackContext";
import { FormActions } from "../../elements/FormActions";
import { getOnlyNumbers } from "../../libs/Utils";
import { DATE_FORMAT, DEFAULT_SCHEDULE_RANGE, NUM_DAYSMAP } from "../../libs/constants";

const TurnosFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const idTurnoMod = id === undefined ? 0 : id;
    const { setSnackData } = useSnack();
    useEffect(() => {
        // Limpia cualquier mensaje residual al entrar
        setSnackData({ open: false, mensaje: '', type: 'success' });
    }, []);
    const hoy = dayjs();

    // --- ESTADOS ---
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [especialidad, setEspecialidad] = useState('');
    const [medico, setMedico] = useState(0);
    const [horarioSemanal, setHorarioSemanal] = useState([]);
    const [fecha, setFecha] = useState(dayjs(searchParams.get("f") || dayjs(), DATE_FORMAT));
    const [fechasConTurno, setFechasConTurno] = useState([]);
    const [highlightedDays, setHighlitedDays] = useState([]);
    const [horasConTurno, setHorasConTurno] = useState([]);
    const [paciente, setPaciente] = useState({ id: null, apellido: '', nombre: '', dni: '' });
    const [timeError, setTimeError] = useState({});

    const [medicoHor, setMedicoHor] = useState({
        minTime: dayjs().hour(DEFAULT_SCHEDULE_RANGE.minHour).minute(0).second(0),
        maxTime: dayjs().hour(DEFAULT_SCHEDULE_RANGE.maxHour).minute(0).second(0)
    });

    const datosIniciales = {
        medicoid: { campo: 'medicoid', dato: '', requerido: true, error: false },
        pacienteid: { campo: 'pacienteid', dato: '', requerido: true, error: false },
        fecha: { campo: 'fecha', dato: null, requerido: false, error: false },
        hora: { campo: 'hora', dato: null, requerido: true, error: false },
        estadoid: { campo: 'estadoid', dato: 1, requerido: false, error: false },
        observaciones: { campo: 'observaciones', dato: '', requerido: false, error: false },
        dni: { campo: 'dni', dato: '', requerido: true, error: false }
    };

    const [turno, setTurno] = useState(datosIniciales);

    // --- LÓGICA DE CARGA INICIAL (ESPECIALIDADES Y EDICIÓN) ---
    useEffect(() => {
        const inicializarFormulario = async () => {
            setLoading(true);
            try {
                // Ejecutamos cargas base en paralelo
                await Promise.all([listarEspecialidadesCubiertas(), listarEstados()]);

                if (idTurnoMod !== 0) {
                    await cargarTurno(
                        idTurnoMod, datosIniciales, setTurno, turno,
                        setEspecialidad, setMedico, setPaciente, setLoading, setSnackData
                    );
                }
            } catch (error) {
                console.error("Error en inicialización:", error);
            } finally {
                setLoading(false);
            }
        };
        inicializarFormulario();
    }, [idTurnoMod]);

    // --- LÓGICA DE MÉDICO (HORARIOS Y OCUPACIÓN) ---
    useEffect(() => {
        if (medico > 0) {
            const cargarDatosMedico = async () => {
                setLoading(true);
                try {
                    const [hor, turnosOcupados] = await Promise.all([
                        obtenerHorarioMedico(medico),
                        listarTurnosPorMedico(medico)
                    ]);

                    // Procesar Horario Semanal
                    if (hor) {
                        const horarioProcesado = Object.keys(NUM_DAYSMAP).map(key => {
                            const match = hor.find(d => d.diaSemana === Number(key));
                            return {
                                diaSemana: Number(key),
                                hora_atencion_inicio: match?.horarioAtencionInicio ?? null,
                                hora_atencion_fin: match?.horarioAtencionFin ?? null
                            };
                        });
                        setHorarioSemanal(horarioProcesado);
                    }

                    // Procesar Fechas Ocupadas
                    const fechasMarcar = turnosOcupados.map(t => t.fecha_turno.slice(0, 10));
                    setFechasConTurno(turnosOcupados);
                    setHighlitedDays(fechasMarcar);

                } catch (error) {
                    console.error("Error cargando médico:", error);
                } finally {
                    setLoading(false);
                }
            };
            cargarDatosMedico();
        }
    }, [medico]);

    // --- LÓGICA DE HORAS DISPONIBLES SEGÚN FECHA SELECCIONADA ---
    useEffect(() => {
        if (fecha && fechasConTurno.length > 0) {
            const fechaElegida = fecha.format(DATE_FORMAT);
            const horasCT = fechasConTurno
                .filter(t => dayjs(t.fecha_turno).format(DATE_FORMAT) === fechaElegida)
                .map(t => t.hora_turno);

            setHorasConTurno(horasCT);
        } else {
            setHorasConTurno([]);
        }
    }, [fecha, fechasConTurno]);

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        const val = name === 'dni' ? getOnlyNumbers(value) : value;
        setTurno(prev => ({
            ...prev,
            [name]: { ...prev[name], dato: val, error: false }
        }));
    };

    const handleEspChange = (e, o) => setEspecialidad(o.props.value);

    const handleMedChange = (e, o) => {
        const target = o.props;
        setMedico(target.value);
        setMedicoHor({
            minTime: dayjs(target['data-ini'], 'HH:mm:ss'),
            maxTime: dayjs(target['data-fin'], 'HH:mm:ss')
        });
        handleChange(e);
    };

    const handleFecChange = (dte) => {
        setFecha(dte);
        setTurno(prev => ({
            ...prev,
            fecha: { ...prev.fecha, dato: dte }
        }));
    };

    const handleTimeAccept = (tme, nme) => {
        let horaFinal = null;
        if (tme) {
            // Normalizamos a la hora en punto para evitar minutos residuales
            horaFinal = dayjs(tme).minute(0).second(0).toDate();
        }
        setTurno(prev => ({
            ...prev,
            [nme]: { ...prev[nme], dato: horaFinal, error: false }
        }));
    };

    const handlePacienteSelect = (newValue) => {
        if (newValue) {
            setTurno(prev => ({
                ...prev,
                dni: { ...prev.dni, dato: newValue.dni, error: false },
                pacienteid: { ...prev.pacienteid, dato: newValue.id }
            }));
            setPaciente(newValue);
        }
    };

    const handleSubmit = SubmitForm(
        turno, setTurno, setTimeError, handleFecChange,
        hoy, idTurnoMod, navigate, setSaving
    );

    return (
        <>
            <Typography variant="h1" className="page-title" color="primary">
                Turnos - {idTurnoMod === 0 ? "Alta" : "Modificación"}
            </Typography>

            {loading && <Box sx={{ width: '100%', mb: 2 }}><LinearProgress /></Box>}

            <Paper elevation={0} sx={{ backgroundColor: 'transparent', my: 1, p: 2 }}>
                <form onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                        <EspecialidadSelector
                            especialidad={especialidad}
                            onChange={handleEspChange}
                        />

                        <MedicoSelector
                            medico={medico}
                            turno={turno}
                            especialidad={especialidad}
                            onChange={handleMedChange}
                        />

                        <FechaHoraPicker
                            turno={turno}
                            fecha={fecha}
                            medicoHor={medicoHor}
                            horarioSemanal={horarioSemanal}
                            highlightedDays={highlightedDays}
                            horasConTurno={horasConTurno}
                            timeError={timeError}
                            setTimeError={setTimeError}
                            onChangeDate={handleFecChange}
                            onChangeTime={handleTimeAccept}
                        />

                        <PacienteSelector
                            turno={turno}
                            paciente={paciente}
                            onSelect={handlePacienteSelect}
                        />

                        <EstadoSelector
                            turno={turno}
                            onChange={(e, o) => handleChange(e)}
                        />

                        <ObservacionesInput
                            turno={turno}
                            onChange={handleChange}
                        />

                        <Grid item xs={12}>
                            <FormActions
                                onSubmit={handleSubmit}
                                loading={saving}
                            />
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </>
    );
};

export default TurnosFormPage;