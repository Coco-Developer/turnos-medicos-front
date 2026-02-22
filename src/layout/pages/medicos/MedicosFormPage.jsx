import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import {Paper, Box, LinearProgress} from "@mui/material";
import Grid from "@mui/material/Grid";
import { obtenerMedico } from "../../../services/medicos.service";
import {PersonalInfoInputs} from "./PersonalInfoInputs";
import {ContactInfoInputs} from "./ContactInfoInputs";
import {IdentificationInput} from "./IdentificationInput";
import {EspecialidadSelector} from "./EspecialidadSelector";
import {SchedulePicker} from "./SchedulePicker";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {listarEspecialidades} from "../../../services/especialidades.service";
import {getOnlyLettersEs, getOnlyNumbers} from "../../libs/Utils";
import {JoinDatePicker} from "./JoinDatePicker";
import {FormActions} from "../../elements/FormActions";
import {SubmitForm} from "./FnGen";
import {FotoUploader} from "./FotoUploader";
import {DAYS, DEFAULT_SCHEDULE_RANGE, NUM_DAYSMAP} from "../../libs/constants";

dayjs.extend(customParseFormat);
//==============================================================================
const MedicosFormPage = () => {
    //const navigate = useNavigate();
    const { id } = useParams();
    const idMedicoMod = id === undefined ? 0 : id;
    const [loading, setLoading] = useState(Boolean(id));
    const [saving, setSaving] = useState(false);
    const isEditing = Boolean(id);
    //--------------------------------------------------------------------------
    const defaultValues = useMemo(() => ({
        iniDte: dayjs(),
        iniTime: dayjs().hour(DEFAULT_SCHEDULE_RANGE.startHour).minute(0).second(0),
        endTime: dayjs().hour(DEFAULT_SCHEDULE_RANGE.endHour).minute(0).second(0),
        minTime: dayjs().hour(DEFAULT_SCHEDULE_RANGE.minHour).minute(0).second(0),
        maxTime: dayjs().hour(DEFAULT_SCHEDULE_RANGE.maxHour).minute(0).second(0),
    }), []);
    //--------------------------------------------------------------------------
    // Idea para preservar el estado inicial obtenido de:
    // https://stackoverflow.com/a/54896006

    // Referencia de las propiedades de los objetos:
    // campo: Nombre del campo en la API. HARDCODED
    // dato: Acá se almacena el dato en sí. VARIABLE
    // requerido: Si validar o no por vacío. HARDCODED
    // error: Si mostrar o no un error. VARIABLE
    // En edición: horarios = null; En alta: horarios con valores por defecto

    const datosIniciales = useMemo(() => {
        const ini = isEditing ? null : defaultValues.iniTime;
        const fin = isEditing ? null : defaultValues.endTime;

        return {
            apellido: {
                campo: 'apellido',
                dato: '',
                requerido: true,
                error: false
            },
            nombre: {
                campo: 'nombre',
                dato: '',
                requerido: true,
                error: false
            },
            telefono: {
                campo: 'telefono',
                dato: '',
                requerido: true,
                error: false
            },
            direccion: {
                campo: 'direccion',
                dato: '',
                requerido: true,
                error: false
            },
            dni: {
                campo: 'dni',
                rotulo: 'DNI', dato: '',
                requerido: true,
                error: false
            },
            especialidadid: {
                campo: 'especialidadid',
                dato: '',
                requerido: true,
                error: false
            },
            fechaaltalaboral: {
                campo: 'fechaaltalaboral',
                dato: defaultValues.iniDte,
                requerido: false,
                error: false
            },

            // Horarios: si estás editando, arrancan en null para evitar valores por defecto
            horarioatencion_lun_inicio: {
                campo: 'horarioatencion_lun_inicio',
                dato: ini,
                requerido: false,
                error: false
            },
            horarioatencion_lun_fin: {
                campo: 'horarioatencion_lun_fin',
                dato: fin,
                requerido: false,
                error: false
            },
            horarioatencion_mar_inicio: {
                campo: 'horarioatencion_mar_inicio',
                dato: ini,
                requerido: false,
                error: false
            },
            horarioatencion_mar_fin: {
                campo: 'horarioatencion_mar_fin',
                dato: fin,
                requerido: false,
                error: false
            },
            horarioatencion_mie_inicio: {
                campo: 'horarioatencion_mie_inicio',
                dato: ini,
                requerido: false,
                error: false
            },
            horarioatencion_mie_fin: {
                campo: 'horarioatencion_mie_fin',
                dato: fin,
                requerido: false,
                error: false
            },
            horarioatencion_jue_inicio: {
                campo: 'horarioatencion_jue_inicio',
                dato: ini,
                requerido: false,
                error: false
            },
            horarioatencion_jue_fin: {
                campo: 'horarioatencion_jue_fin',
                dato: fin,
                requerido: false,
                error: false
            },
            horarioatencion_vie_inicio: {
                campo: 'horarioatencion_vie_inicio',
                dato: ini,
                requerido: false,
                error: false
            },
            horarioatencion_vie_fin: {
                campo: 'horarioatencion_vie_fin',
                dato: fin,
                requerido: false,
                error: false
            },
            horarioatencion_sab_inicio: {
                campo: 'horarioatencion_sab_inicio',
                dato: ini,
                requerido: false,
                error: false
            },
            horarioatencion_sab_fin: {
                campo: 'horarioatencion_sab_fin',
                dato: fin,
                requerido: false,
                error: false
            },
            horarioatencion_dom_inicio: {
                campo: 'horarioatencion_dom_inicio',
                dato: ini,
                requerido: false,
                error: false
            },
            horarioatencion_dom_fin: {
                campo: 'horarioatencion_dom_fin',
                dato: fin,
                requerido: false,
                error: false
            },

            foto: {
                campo: 'foto',
                dato: '',           // Binario base64
                requerido: false,
                error: false
            },
            matricula: {
                campo: 'matricula',
                rotulo: 'Matrícula', dato: '',
                requerido: true,
                error: false
            },
        };
    }, [isEditing, defaultValues]);
    //--------------------------------------------------------------------------
    const [medico, setMedico] = useState(datosIniciales);
    //--------------------------------------------------------------------------
    const parseHora = (hhmmss) => {
        if (!hhmmss) return null;
        const [H, M, S] = hhmmss.split(':').map(Number);
        return dayjs().hour(H || 0).minute(M || 0).second(S || 0).millisecond(0);
    };
    //--------------------------------------------------------------------------
    const mapHorariosToMed = (med, horariosApi) => {
        const arr = Array.isArray(horariosApi) ? horariosApi : (horariosApi?.dato ?? []);
        const out = { ...med };

        // Indexar por clave de día (lun, mar, mie, ...)
        const byKey = new Map();
        for (const h of arr) {
            const key = NUM_DAYSMAP[h.diaSemana];
            if (key) byKey.set(key, h);
        }

        // Recorrer todos los días; si no existe en la API, poner null
        for (const { key } of DAYS) {
            const h = byKey.get(key);

            const inicioField = `horarioatencion_${key}_inicio`;
            const finField = `horarioatencion_${key}_fin`;

            out[inicioField] = {
                ...(out[inicioField] ?? { campo: inicioField, requerido: false, error: false }),
                dato: h ? parseHora(h.horarioAtencionInicio) : null,
            };

            out[finField] = {
                ...(out[finField] ?? { campo: finField, requerido: false, error: false }),
                dato: h ? parseHora(h.horarioAtencionFin) : null,
            };
        }

        return out;
    };

    //--------------------------------------------------------------------------
    // Si es modificación, cargar los datos del médico
    const cargarMedico = (id) =>{
        if (id !== 0){
            obtenerMedico(id).then( (r) => {
                let med = datosIniciales;
                const dat = {
                    apellido: {
                        dato: r.apellido
                    },
                    nombre: {
                        dato: r.nombre
                    },
                    telefono: {
                        dato: r.telefono
                    },
                    direccion: {
                        dato: r.direccion
                    },
                    dni: {
                        dato: r.dni
                    },
                    especialidadid: {
                        dato: r.especialidadId
                    },
                    fechaaltalaboral: {
                        dato: r.fechaAltaLaboral
                    },
                    foto: {
                        dato: r.foto
                    },
                    matricula: {
                        dato: r.matricula
                    },
                };

                for (const key of Object.keys(med)) {
                    med[key] = {...med[key], ...dat[key]}
                }

                // Pasar "horarios" de la API -> campos "horarioatencion_*_inicio/fin" de "med"
                med = mapHorariosToMed(med, r.horarios);

                setMedico(med);

                setLoading(false)
            });
        }
        else {
            setLoading(false);
        }
    }
    //--------------------------------------------------------------------------
    const [, setEspecialidades] = useState([]);
    //--------------------------------------------------------------------------
    const cargarEspecialidades = () =>{
        listarEspecialidades().then( (r) => {
            setEspecialidades(r);
        });
    }
    useEffect(() => {
        //console.log('Cargar medico');
        setLoading(true);
        cargarEspecialidades();
        cargarMedico(idMedicoMod);
        //eslint-disable-next-line
    }, [idMedicoMod]);
    //--------------------------------------------------------------------------
    //------------------------------HANDLERS------------------------------------
    //--------------------------------------------------------------------------
    const handleChange = (e) => {
        //console.info('handleChange');
        //console.info(e);
        const target = e.target;
        if (target.name === 'telefono' || target.name === 'dni'){
            // Dejar solo los números
            target.value = getOnlyNumbers(target.value);
        }

        if (target.name === 'nombre' || target.name === 'apellido' ){
            // Solo letras, acentos, eñes, diéresis y espacio
            target.value = getOnlyLettersEs(target.value);
        }

        const med = {...medico[target.name], ...{dato: target.value}};

        setMedico({
            ...medico,
            [target.name]: med
        });
    };
    //--------------------------------------------------------------------------
    const handleSubmit = SubmitForm(medico, setMedico, idMedicoMod, setSaving, defaultValues);

    //**************************************************************************
    //**************************************************************************
    //**************************************************************************
    return (
        <>
            <Typography variant="h1" className="page-title" color="primary">
                Medicos - {idMedicoMod === 0 ? "Alta" : "Modificación"}
            </Typography>
            {loading && <Box sx={{ width: '100%' }}><LinearProgress /></Box>}
            <Paper elevation={0} sx={{ backgroundColor: 'transparent', my: 1, mx: 'auto', p: 2 }}>
                <form onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <PersonalInfoInputs
                                medico={medico}
                                setMedico={setMedico}
                                onChange={handleChange}
                            />
                            <IdentificationInput
                                medico={medico}
                                setMedico={setMedico}
                                onChange={handleChange}
                            />
                        </Grid>

                        <FotoUploader
                            medico={medico}
                            setMedico={setMedico}
                        />
                        <ContactInfoInputs
                            medico={medico}
                            setMedico={setMedico}
                            onChange={handleChange}
                        />
                        <EspecialidadSelector
                            medico={medico}
                            setMedico={setMedico}
                            onChange={handleChange}
                        />
                        {(!isEditing || !loading) && (
                            <SchedulePicker
                                medico={medico}
                                setMedico={setMedico}
                                defaultValues={defaultValues}
                            />
                        )}

                        <JoinDatePicker
                            medico={medico}
                            setMedico={setMedico}
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
export default MedicosFormPage;