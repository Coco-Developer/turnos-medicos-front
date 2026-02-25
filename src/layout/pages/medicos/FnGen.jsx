import dayjs from "dayjs";
import { crearMedico, modificarMedico } from "../../../services/medicos.service";
import { useSnack } from "../../context/SnackContext";
import { DATE_FORMAT, DAYSMAP } from "../../libs/constants";

export const handleValidation = (medico, setMedico) => (e) => {
    const isValid = !(e.target.value === '');
    const med = { ...medico[e.target.name], error: !isValid };
    setMedico({ ...medico, [e.target.name]: med });
    return isValid;
};

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
            const asDayjs = dayjs(value.dato).second(0).millisecond(0);
            if (!asDayjs.isValid()) {
                isNotValid = true;
                errorCode = "invalidDate";
            } else {
                const min = defaultValues.minTime.second(0).millisecond(0);
                const max = defaultValues.maxTime.second(0).millisecond(0);
                if (asDayjs.isBefore(min) || asDayjs.isAfter(max)) {
                    isNotValid = true;
                    errorCode = "outOfRange";
                }
            }
        }

        updated[key] = { ...value, error: isNotValid, errorCode };
        if (isNotValid) allOK = false;
    }

    // 2. Validación de pares inicio–fin por día de semana (TU LÓGICA ORIGINAL)
    Object.keys(DAYSMAP).forEach(dayKey => {
        const iniKey = `horarioatencion_${dayKey}_inicio`;
        const finKey = `horarioatencion_${dayKey}_fin`;

        let inicio = updated[iniKey]?.dato ?? null;
        let fin = updated[finKey]?.dato ?? null;

        const mismatch = (inicio && !fin) || (!inicio && fin);

        if (mismatch) {
            allOK = false;
        } else if (inicio && fin) {
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

    // 3. Validación: al menos un día completo (TU LÓGICA ORIGINAL)
    const tieneAlMenosUnDia = Object.keys(DAYSMAP).some(dayKey => {
        const iniKey = `horarioatencion_${dayKey}_inicio`;
        const finKey = `horarioatencion_${dayKey}_fin`;
        return updated[iniKey]?.dato && updated[finKey]?.dato;
    });

    if (!tieneAlMenosUnDia) {
        allOK = false;
        Object.keys(DAYSMAP).forEach(dayKey => {
            updated[`horarioatencion_${dayKey}_inicio`].error = true;
            updated[`horarioatencion_${dayKey}_fin`].error = true;
            updated[`horarioatencion_${dayKey}_inicio`].errorCode = "noWorkingDay";
        });
    }

    return { allOK, updated };
};

export const SubmitForm = (medico, setMedico, idMedicoMod, setSaving, defValues) => {
    const { setSnackData } = useSnack();

    return async (event) => {
        event.preventDefault();
        const { allOK, updated } = validateForm(medico, defValues);
        setMedico(updated);

        if (allOK) {
            setSaving(true);
            
            // --- CONSTRUCCIÓN DEL OBJETO NORMALIZADO ---
            // Usamos PascalCase para coincidir con el Backend C#
            let medDto = {
                Id: parseInt(idMedicoMod),
                Apellido: updated.apellido.dato,
                Nombre: updated.nombre.dato,
                Telefono: updated.telefono.dato,
                Direccion: updated.direccion.dato,
                Dni: updated.dni.dato,
                EspecialidadId: parseInt(updated.especialidadid.dato),
                FechaAltaLaboral: dayjs(updated.fechaaltalaboral.dato).format("YYYY-MM-DDTHH:mm:ss"),
                Matricula: updated.matricula.dato,
                Foto: updated.foto.dato || null,
                Horarios: []
            };

            // Mapeo de horarios preservando tu estructura de DAYSMAP
            Object.keys(DAYSMAP).forEach(dayKey => {
                const ini = updated[`horarioatencion_${dayKey}_inicio`].dato;
                const fin = updated[`horarioatencion_${dayKey}_fin`].dato;

                if (ini && fin) {
                    medDto.Horarios.push({
                        MedicoId: parseInt(idMedicoMod),
                        DiaSemana: DAYSMAP[dayKey],
                        HorarioAtencionInicio: dayjs(ini).format("HH:mm:ss"),
                        HorarioAtencionFin: dayjs(fin).format("HH:mm:ss")
                    });
                }
            });

            try {
                const r = idMedicoMod === 0 
                    ? await crearMedico(medDto) 
                    : await modificarMedico(idMedicoMod, medDto);

                setSaving(false);
                if (r.status === 200 || r.status === 201) {
                    setSnackData({
                        duration: 8000,
                        type: 'success',
                        message: 'Guardado correctamente. Volviendo...',
                        open: true,
                        href: '/medicos'
                    });
                } else {
                    setSnackData({
                        type: 'error',
                        message: r.statusText || 'Error al guardar',
                        open: true
                    });
                }
            } catch (error) {
                setSaving(false);
                setSnackData({
                    type: 'error',
                    message: 'Error de conexión con el servidor',
                    open: true
                });
            }
        } else {
            setSnackData({
                type: 'error',
                message: 'Verifique los campos marcados en rojo.',
                open: true
            });
        }
    };
};