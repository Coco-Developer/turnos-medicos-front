import dayjs from "dayjs";
import {crearTurno, modificarTurno, obtenerTurno} from "../../../services/turnos.service";
import {obtenerPacientePorDNI} from "../../../services/pacientes.service";
import {useSnack} from "../../context/SnackContext";
import {DATE_FORMAT} from "../../libs/constants";

//------------------------------------------------------------------------------
const validateForm = (turno, setTurno, setTimeError, handleFecChange, hoy) => {
    //console.log('ValidForm');
    // Validar TODOS los campos de una sola vez.
    let allOK = true; // Se asumen todos los campos OK.
    let isNotValid = false;

    for (const [key, value] of Object.entries(turno)) {
        if (value.requerido){
            isNotValid = (value.dato === ''); // Verdadero si vacío

            // Tratamiento especial de los nulos
            if (value.campo === 'hora'){
                isNotValid = (value.dato === null); // Verdadero si nulo
            }

            if (isNotValid){
                // allOK es verdadero si TODOS los campos son válidos.
                allOK = allOK && !isNotValid;

                value.error = isNotValid;
                setTurno({
                    ...turno,
                    [key]: value
                });

                // Tratamiento especial de la hora
                if (value.campo === 'hora'){
                    setTimeError({err: 'invalidDate', fld: value.campo})
                    turno.hora.error = value.error;
                }
            }
        }
        if (value.campo === 'fecha'){
            if (value.dato === null){
                handleFecChange(hoy);
            }
        }
    }
    return allOK;
}
//------------------------------------------------------------------------------
export const SubmitForm = (turno, setTurno, setTimeError, handleFecChange, hoy, idTurnoMod, navigate, setSaving) => {
    const { setSnackData } = useSnack();
    return (event) => {
        //console.log('handleSubmit');
        event.preventDefault()

        const isValid = validateForm(turno, setTurno, setTimeError, handleFecChange, hoy);
        let trn = {};

        if (isValid) {
            setSaving(true);
            // Preparar el objeto con los datos a guardar.
            for (const [key, value] of Object.entries(turno)) {
                trn = {...trn, [key]: value.dato}
            }
            delete trn.trn; // Se borra la prop extra.

            if (!(typeof trn.hora === 'string' || trn.hora instanceof String)) {
                trn.hora = dayjs(trn.hora).format('HH:mm:00')
            }

            if (trn.fecha === null) {
                trn.fecha = hoy;
            }

            if (idTurnoMod === 0) {
                crearTurno(trn).then((r) => {
                    setSaving(false);
                    if (r.status === 200) {
                        setSnackData({
                            duration: 8000,
                            type: 'success',
                            message: 'Guardado correctamente. Volviendo a Lista...',
                            open: true,
                            action: 'alta',
                            href: '/turnos'
                        });
                    } else {
                        const errorText = r.statusText ?? 'Hubo un error al guardar. Vuelva a intentarlo.';

                        setSnackData({
                            type: 'error',
                            message: errorText,
                            open: true,
                            action: ''
                        });
                    }
                });
            } else {
                // Se pasa la fecha a string
                if (!(typeof trn.fecha === 'string' || trn.fecha instanceof String)) {
                    trn.fecha = dayjs(trn.fecha).format(DATE_FORMAT)
                }

                modificarTurno(idTurnoMod, trn).then((r) => {
                    //console.log(r);
                    setSaving(false);
                    if (r.status === 200) {
                        setSnackData({
                            duration: 6000,
                            type: 'success',
                            message: 'Actualizado correctamente. Volviendo a Lista...',
                            open: true,
                            action: 'mod',
                            href: '/turnos'
                        });
                    } else {
                        const errorText = r.statusText ?? 'Hubo un error al actualizar. Vuelva a intentarlo.';

                        setSnackData({
                            type: 'error',
                            message: errorText,
                            open: true
                        })
                    }
                });
            }

        } else {
            setSnackData({
                type: 'error',
                message: 'Verifique los campos marcados en rojo.',
                open: true
            })
        }

    };
};
//------------------------------------------------------------------------------
export const cargarPaciente = (setSaving, turno, setPaciente, setTurno, setSnackData) => {
    setSaving(true);

    obtenerPacientePorDNI(turno.dni.dato).then((r) => {
        if (!('status' in r)) {
            turno.dni.error = false;
            setPaciente(r);

            const trn = {...turno['pacienteid'], ...{dato: r.id}};

            setTurno({
                ...turno,
                ['pacienteid']: trn
            });
        } else {
            turno.dni.error = true;

            const errorText = r.statusText ?? 'Hubo un error al obtener los datos del Paciente. Vuelva a intentarlo.';

            setSnackData({
                type: 'error',
                message: errorText,
                open: true,
                action: ''
            });
        }
        setSaving(false);
    });
}
//------------------------------------------------------------------------------
export const cargarTurno = (id, datosIniciales, setTurno, turno, setEspecialidad, setMedico, setPaciente, setSaving, setSnackData) => {
    //console.log('Cargar turno (FnGen)', id);
    if (id !== 0) {
        obtenerTurno(id).then((r) => {
            let trn = datosIniciales;
            const dat = {
                fecha: {
                    dato: dayjs(r.fecha)
                },
                hora: {
                    dato: `${r.hora}:00`
                },
                medicoid: {
                    dato: r.medicoId
                },
                pacienteid: {
                    dato: r.pacienteId
                },
                dni: {
                    dato: r.pacienteDni
                },
                medico: {
                    dato: r.medico
                },
                paciente: {
                    dato: r.paciente
                },
                estadoid: {
                    dato: r.estadoId
                },
                estado: {
                    dato: r.estado
                },
                observaciones: {
                    dato: r.observaciones
                }
            };

            for (const key of Object.keys(trn)) {
                trn[key] = {...trn[key], ...dat[key]}
            }
            setTurno({
                ...turno,
                trn
            });
            // Paciente
            cargarPaciente(setSaving, turno, setPaciente, setTurno, setSnackData);
            // Especialidad
            setEspecialidad(r.especialidadId);
            // Médico
            setMedico(r.medicoId);
        });
    }
}
