import dayjs from "dayjs";
import {crearMedico, modificarMedico} from "../../../services/medicos.service";
import {useSnack} from "../../context/SnackContext";
import {DATE_FORMAT, DAYSMAP} from "../../libs/constants";


//------------------------------------------------------------------------------
export const handleValidation = (medico, setMedico) => (e) => {
    const isValid = !(e.target.value === '');
    const med = { ...medico[e.target.name], ...{ error: !isValid } };
    setMedico({ ...medico, [e.target.name]: med });
    return isValid;
};

//------------------------------------------------------------------------------
const validateForm = (medico, defaultValues) => {
    let allOK = true;
    let updated = { ...medico };

    // 1. Validación de campos requeridos + horarios inválidos
    for (const [key, value] of Object.entries(medico)) {
        let isNotValid = false;
        let errorCode = null;

        if (value.requerido && value.dato === "") {
            isNotValid = true;
            errorCode = "required";
        }

        if (key.startsWith("horarioatencion_") && value.dato) {
            // Normalizar por las dudas:
            const asDayjs = dayjs(value.dato).second(0).millisecond(0);

            if (!asDayjs.isValid()) {
                isNotValid = true;
                errorCode = "invalidDate";
            } else {
                // Normalizar por las dudas:
                const min = defaultValues.minTime.second(0).millisecond(0);
                const max = defaultValues.maxTime.second(0).millisecond(0);
                if (asDayjs.isBefore(min) || asDayjs.isAfter(max)) {
                    isNotValid = true;
                    errorCode = "outOfRange";
                }
            }
        }

        updated[key] = {
            ...value,
            error: isNotValid,
            errorCode
        };
        if (isNotValid) allOK = false;
    }

    // 2. Validación de pares inicio–fin por día de semana
    Object.keys(DAYSMAP).forEach(dayKey => {
        const iniKey = `horarioatencion_${dayKey}_inicio`;
        const finKey = `horarioatencion_${dayKey}_fin`;

        let inicio = medico[iniKey]?.dato ?? null;
        let fin = medico[finKey]?.dato ?? null;

        const mismatch = (inicio && !fin) || (!inicio && fin);

        if (mismatch) {
            allOK = false;
        }
        else if (inicio && fin) {
            // Si inicio > fin, intercambiar
            const iniDay = dayjs(inicio);
            const finDay = dayjs(fin);
            if (iniDay.isAfter(finDay)) {
                const tmp = inicio;
                inicio = fin;
                fin = tmp;
            }
        }

        updated[iniKey] = {
            ...updated[iniKey],
            dato: inicio,
            error: mismatch || updated[iniKey].error,
            errorCode: mismatch ? "pairMismatch" : updated[iniKey].errorCode
        };
        updated[finKey] = {
            ...updated[finKey],
            dato: fin,
            error: mismatch || updated[finKey].error,
            errorCode: mismatch ? "pairMismatch" : updated[finKey].errorCode
        };
    });

    // 3. Validación: al menos un día completo trabajado
    const tieneAlMenosUnDia = Object.keys(DAYSMAP).some(dayKey => {
        const iniKey = `horarioatencion_${dayKey}_inicio`;
        const finKey = `horarioatencion_${dayKey}_fin`;
        const inicio = medico[iniKey]?.dato ?? null;
        const fin = medico[finKey]?.dato ?? null;
        return inicio && fin;
    });

    if (!tieneAlMenosUnDia) {
        allOK = false;

        Object.keys(DAYSMAP).forEach(dayKey => {
            const iniKey = `horarioatencion_${dayKey}_inicio`;
            const finKey = `horarioatencion_${dayKey}_fin`;

            updated[iniKey] = {
                ...updated[iniKey],
                error: true,
                errorCode: "noWorkingDay"
            };
            updated[finKey] = {
                ...updated[finKey],
                error: true,
                errorCode: "noWorkingDay"
            };
        });
    }

    return { allOK, updated };
};

//------------------------------------------------------------------------------
export const SubmitForm = (medico, setMedico, idMedicoMod, setSaving, defValues) => {
    const { setSnackData } = useSnack();
    return (event) => {
        //console.info('handleSubmit');
        event.preventDefault()

        //const isValid = validateForm(medico, setMedico, defValues);
        const { allOK, updated } = validateForm(medico, defValues);
        setMedico(updated);

        let med = {};

        if (allOK) {
            setSaving(true);
            let horarios = [];
            // Preparar el objeto con los datos a guardar.
            for (const [key, value] of Object.entries(updated)) {
                //console.log(key, value.dato);
                if (key.startsWith('horarioatencion')) {
                    // Extraer partes: horarioatencion_[dia]_[inicio|fin]
                    const partes = key.split('_');
                    const diaStr = partes[1];
                    const tipo = partes[2]; // 'inicio' o 'fin'
                    const diaSemana = DAYSMAP[diaStr];

                    // Buscar si ya existe el objeto para ese día
                    let horario = horarios.find(h => h.diaSemana === diaSemana);
                    if (!horario) {
                        horario = {
                            medicoId: idMedicoMod,
                            diaSemana: diaSemana,
                            horarioAtencionInicio: '',
                            horarioAtencionFin: ''
                        };
                        horarios.push(horario);
                    }

                    // Asignar el valor formateado
                    const horaStr = value.dato === null
                        ? null
                        : (typeof value.dato === 'object'
                            ? dayjs(value.dato).format('HH:mm:ss')
                            : value.dato);

                    // Asignar el valor correcto según el tipo
                    if (tipo === 'inicio') {
                        horario.horarioAtencionInicio = horaStr;
                    } else if (tipo === 'fin') {
                        horario.horarioAtencionFin = horaStr;
                    }
                }

                if (key === 'fechaaltalaboral') {
                    if (typeof value.dato == 'object') {
                        value.dato = dayjs(value.dato).format(DATE_FORMAT);
                    }
                }
                if (!key.startsWith('horarioatencion')) {
                    med = {...med, [key]: value.dato}
                }
            }
            delete med.med; // Se borra la prop extra.
            med.horarios = horarios;

            //console.log(med);

            if (idMedicoMod === 0) {
                //console.log(med);

                //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // TO-DO: Verificar si el DNI ya existe antes de crear?
                // (no recuerdo si este tira la bronca al guardar con un DNI que
                // ya existe)
                //¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡

                crearMedico(med).then((r) => {
                    setSaving(false);
                    if (r.status === 200) {
                        setSnackData({
                            duration: 8000,
                            type: 'success',
                            message: 'Guardado correctamente. Volviendo a Lista...',
                            open: true,
                            action: 'alta',
                            href: '/medicos'
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
                modificarMedico(idMedicoMod, med).then((r) => {
                    setSaving(false);
                    if (r.status === 200) {
                        setSnackData({
                            duration: 6000,
                            type: 'success',
                            message: 'Actualizado correctamente. Volviendo a Lista...',
                            open: true,
                            action: 'mod',
                            href: '/medicos'
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
}