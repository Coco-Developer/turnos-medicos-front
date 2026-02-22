import {useEffect, useMemo, useState} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import Typography from "@mui/material/Typography";
import {LinearProgress, Paper} from "@mui/material";
import Grid from '@mui/material/Grid';
import {listarEspecialidadesCubiertas} from "../../../services/especialidades.service";
import {listarEstados} from "../../../services/estados.service";
import {listarTurnosPorMedico} from "../../../services/turnos.service";

import {faBan, faCalendarPlus, faCircleCheck} from '@fortawesome/free-solid-svg-icons'
import dayjs from "dayjs";
import 'dayjs/locale/es';
import {getOnlyNumbers} from "../../libs/Utils";
import Box from "@mui/material/Box";
import {listarMedicosPorEspecialidad, obtenerHorarioMedico} from "../../../services/medicos.service";
import {listarPacientes} from "../../../services/pacientes.service";
import {EspecialidadSelector} from "./EspecialidadSelector";
import {MedicoSelector} from "./MedicoSelector";
import {FechaHoraPicker} from "./FechaHoraPicker";
import {PacienteSelector} from "./PacienteSelector";
import {EstadoSelector} from "./EstadoSelector";
import {ObservacionesInput} from "./ObservacionesInput";
import {cargarTurno, SubmitForm} from "./FnGen";
import {useSnack} from "../../context/SnackContext";
import {FormActions} from "../../elements/FormActions";
import {DATE_FORMAT, DEFAULT_SCHEDULE_RANGE, NUM_DAYSMAP, TIME_FORMAT} from "../../libs/constants";


//==============================================================================
const TurnosFormPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const idTurnoMod = id === undefined ? 0 : id;
    const hoy = dayjs();
    const { setSnackData } = useSnack();
    const [saving, setSaving] = useState(false);

    searchParams.get("f"); // Fecha mostrada en la lista de Turnos

    //--------------------------------------------------------------------------
    // Idea para preservar el estado inicial obtenido de:
    // https://stackoverflow.com/a/54896006

    // Referencia de las propiedades de los objetos:
    // campo: Nombre del campo en la API. HARDCODED
    // dato: Acá se almacena el dato en sí. VARIABLE
    // requerido: Si validar o no por vacío. HARDCODED
    // error: Si mostrar o no un error. VARIABLE

    const datosIniciales = {
        medicoid: {
            campo: 'medicoid',
            dato: '',
            requerido: true,
            error: false
        },
        pacienteid: {
            campo: 'pacienteid',
            dato: '',
            requerido: true,
            error: false
        },
        fecha: {
            campo: 'fecha',
            dato: null,
            requerido: false,
            error: false
        },
        hora: {
            campo: 'hora',
            dato: null,
            requerido: true,
            error: false
        },
        estadoid: {
            campo: 'estadoid',
            dato: 1,
            requerido: false,
            error: false
        },
        observaciones: {
            campo: 'observaciones',
            dato: '',
            requerido: false,
            error: false
        },
        dni: {
            campo: 'dni',
            dato: '',
            requerido: true,
            error: false
        }
    };
    //--------------------------------------------------------------------------
    const datosPaciente = {
        id: null,
        apellido: '',
        nombre: '',
        dni: '',
    };
    //--------------------------------------------------------------------------
    const [turno, setTurno] = useState(datosIniciales);
    //--------------------------------------------------------------------------
    const [, setEspecialidades] = useState([]);
    const [especialidad, setEspecialidad] = useState('');
    const cargarEspecialidades = () =>{
        //console.info('Cargar Especialidades');
        setLoading(true);

        listarEspecialidadesCubiertas().then( (r) => {
            setEspecialidades(r);
            setLoading(false);
        });
    }
    //--------------------------------------------------------------------------
    const [, setEstados] = useState([]);
    const [estado, setEstado] = useState('');
    const cargarEstados = () =>{
        //console.info('Cargar Estados');

        listarEstados().then( (r) => {
            setEstados(r);
        });
    }
    //--------------------------------------------------------------------------
    const [medico, setMedico] = useState(0);
    const [, setMedicos] = useState([]);
    const [horarioSemanal, setHorarioSemanal] = useState([]);
    const [medicoHor, setMedicoHor] = useState({
        minTime: dayjs().hour(DEFAULT_SCHEDULE_RANGE.minHour).minute(0).second(0),
        maxTime: dayjs().hour(DEFAULT_SCHEDULE_RANGE.maxHour).minute(0).second(0)
    });
    useEffect(() => {
        //console.info('Cargar Médicos por Especialidad');
        if (especialidad > 0 ){
            setLoading(true);

            listarMedicosPorEspecialidad(especialidad).then( (r) => {
                setMedicos(r);
                setLoading(false);
            });
        }
    }, [especialidad]);
    const cargarHorarioMedico = () => {
        //console.info('Cargar Horario del Médico');

        if (medico > 0 ){
            setLoading(true);

            obtenerHorarioMedico(medico).then( (r) => {
                if (r && r.length > 0){
                    const horario = Object.keys(NUM_DAYSMAP).map(key => {
                        const numKey = Number(key);
                        const match = r.find(d => d.diaSemana === numKey);
                        return {
                            diaSemana: numKey,
                            hora_atencion_inicio: match?.horarioAtencionInicio ?? null,
                            hora_atencion_fin: match?.horarioAtencionFin ?? null
                        };
                    });
                    setHorarioSemanal(horario);
                }
                setLoading(false);
            }).catch( () => {
                setLoading(false);
            });
        }
    }
    useEffect(() => {
        cargarHorarioMedico();
    }, [medico]);
    //--------------------------------------------------------------------------
    const [fechasConTurno, setFechasConTurno] = useState([]);
    const [highlightedDays, setHighlitedDays] = useState([]);
    const [fecha, setFecha] = useState(dayjs(searchParams.get("f"), DATE_FORMAT));
    const [cargarHorasOcupadas, setCargarHorasOcupadas] = useState(0);

    useEffect(() => {
        //console.info('Cargar Fechas por Médico');
        if (turno.medicoid.dato > 0 ) {
            setLoading(true);

            listarTurnosPorMedico(turno.medicoid.dato).then((r) => {
                const fechasCT = r.map(dte => dte.fecha_turno);
                const fechasMarcar = fechasCT.map(dte => dte.slice(0, 10));
                setFechasConTurno(r);
                setHighlitedDays(fechasMarcar);

                if (turno.fecha.dato == null){
                     turno.fecha.dato = hoy;
                     setFecha(hoy);
                }
                handleFecChange(turno.fecha.dato);
                setCargarHorasOcupadas(Math.random()); // Se fuerza la ejecución de la carga de las horas
                setLoading(false);
            });
        }

    }, [turno.medicoid.dato]);
    //--------------------------------------------------------------------------
    const [horasConTurno, setHorasConTurno] = useState([]);

    useEffect(() => {
        //console.info('Cargar Horas con Turno por Médico');
        setHorasConTurno([]);
        //Cargar fechas por Médico
        if (fecha && dayjs(fecha).isValid()){
            setLoading(true);

            const horasCT = fechasConTurno
                .filter(dte => {
                    const fechaElegida = dayjs(turno.fecha.dato).format(DATE_FORMAT);
                    const fechaOcupada = dayjs(dte.fecha_turno).format( DATE_FORMAT);
                    return fechaOcupada == fechaElegida;
                })
                .map(tme => tme.hora_turno);

            // Se toma el primer elemento de horasCT, por como viene de la API.
            setHorasConTurno(horasCT[0]);
            setLoading(false);
        }
    }, [fecha, cargarHorasOcupadas]);
    //--------------------------------------------------------------------------
    const [paciente, setPaciente] = useState(datosPaciente);
    const [, setPacientes] = useState([]);
    const [, setFilteredPacientes] = useState([]);
    //--------------------------------------------------------------------------
    useEffect( () => {
        cargarEspecialidades();
        cargarEstados();

        // Cargar lista completa de pacientes
        listarPacientes().then(r => {
            setPacientes(r);
            setFilteredPacientes(r); // Inicialmente, todos los pacientes están en la lista filtrada
        });
    }, []);
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    // Si es modificación, cargar los datos del turno
    useEffect(() => {
        //console.log('Cargar turno (main)', idTurnoMod);
        cargarTurno(
            idTurnoMod,
            datosIniciales,
            setTurno,
            turno,
            setEspecialidad,
            setMedico,
            setPaciente,
            setLoading,
            setSnackData
        );
        //eslint-disable-next-line
    }, [idTurnoMod]);
    //--------------------------------------------------------------------------
    //------------------------------HANDLERS------------------------------------
    //--------------------------------------------------------------------------
    const handleChange = (e) => {
        //console.info('handleChange');
        const target = e.target;

        if (target.name === 'dni'){
            // Dejar solo los números
            target.value = getOnlyNumbers(target.value);
        }
        const trn = {...turno[target.name], ...{dato: target.value}};

        setTurno({
            ...turno,
            [target.name]: trn
        });
    };
    //--------------------------------------------------------------------------
    const handleEspChange = (e, o) => {
        //console.info('handleEspChange');
        const target = o.props;
        setEspecialidad(target.value);
    }
    //--------------------------------------------------------------------------
    const handleMedChange = (e, o) => {
        //console.info('handleMedChange');
        //console.log(e); //.currentTarget.dataset.ini
        const target = o.props;
        setMedico(target.value);

        // Horario por defecto.
        setMedicoHor({
            minTime: dayjs(target['data-ini'], 'HH:mm:ss'),
            maxTime: dayjs(target['data-fin'], 'HH:mm:ss')
        })

        // Verificar si el día es uno donde trabaja, si no, ¿deseleccionarlo?
        // Si trabaja, ejecutar el evento de selección de fecha.
        // Y cargar el horario de ese día.

        handleChange(e);
    }
    //--------------------------------------------------------------------------
    const handleFecChange = (dte) => {
        //console.info('handleFecChange');
        setFecha(dte);
        const tur = {...turno['fecha'], ...{dato: dte}};
        setTurno({
            ...turno,
            ['fecha']: tur
        });
    }
        //--------------------------------------------------------------------------
    const handleTimeAccept = (tme, nme) => {
        //console.info('handleTimeAccept');
        let h = null;

        if (tme){ // Verificar que el objeto tenga algún valor
            h = new Date();
            h.setHours(tme.$H,0,0);
        }

        const tur = {...turno[nme], ...{dato: h}};
        setTurno({
            ...turno,
            [nme]: tur
        });
        //console.log(turno);
    };
    //--------------------------------------------------------------------------
    const handlePacienteSelect = (newValue) => {
        //console.info('handlePacienteSelect');
        if (newValue) {
            // Seteamos solo el DNI en el input correspondiente
            setTurno((prevTurno) => ({
                ...prevTurno,
                dni: {
                    ...prevTurno.dni,
                    dato: newValue.dni,
                    error: false,
                },
                pacienteid: {
                    ...prevTurno.pacienteid,
                    dato: newValue.id,
                }
            }));

            // Actualiza el estado de paciente con el nombre y apellido del paciente seleccionado
            setPaciente({
                id: newValue.id,
                apellido: newValue.apellido,
                nombre: newValue.nombre,
                dni: newValue.dni,
            } || {});
        }
    };
    //--------------------------------------------------------------------------
    const handleEstChange = (e, o) => {
        //console.info('handleEstChange');
        const target = o.props;
        setEstado(target.value);

        handleChange(e);
    }
    //--------------------------------------------------------------------------
    const [timeError, setTimeError] = useState({});
    //--------------------------------------------------------------------------
    const handleSubmit = SubmitForm(turno, setTurno, setTimeError, handleFecChange, hoy, idTurnoMod, navigate, setSaving);

    //**************************************************************************
    //**************************************************************************
    //**************************************************************************
    return (
        <>
            <Typography variant="h1" className="page-title" color="primary">
                Turnos - {idTurnoMod === 0 ? "Alta" : "Modificación"}
            </Typography>
            {loading && <Box sx={{ width: '100%' }}><LinearProgress /></Box>}
            <Paper elevation={0} sx={{ backgroundColor: 'transparent', my: 1, mx: 'auto', p: 2 }}>
                <form onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={2}>
                        <EspecialidadSelector
                            especialidad={especialidad}
                            setEspecialidad={setEspecialidad}
                            onChange={handleEspChange}
                        />
                        <MedicoSelector
                            medico={medico}
                            setMedico={setMedico}
                            turno={turno}
                            setTurno={setTurno}
                            especialidad={especialidad}
                            onChange={handleMedChange}
                        />
                        <FechaHoraPicker
                            turno={turno}
                            setTurno={setTurno}
                            fecha={fecha}
                            setFecha={setFecha}
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
                            setTurno={setTurno}
                            onChange={handleEstChange}
                        />
                        <ObservacionesInput
                            turno={turno}
                            setTurno={setTurno}
                            onChange={handleChange}
                        />
                        <FormActions
                            onSubmit={handleSubmit}
                            loading={saving}
                        />
                    </Grid>
                </form>
            </Paper>
        </>
    );
};

export default TurnosFormPage;