import dayjs from "dayjs";
import { crearMedico, modificarMedico } from "../../../services/medicos.service";
import { DAYSMAP } from "../../libs/constants";

/**
 * HandleValidation Normalizado
 */
export const handleValidation = (estadoLocal, setMedico) => (e) => {
    const { name, value } = e.target;
    const isValid = value !== '';
    
    setMedico((prev) => ({
        ...prev,
        [name]: { 
            ...prev[name], 
            error: !isValid 
        }
    }));
    
    return isValid;
};

/**
 * Lógica de validación interna
 */
const validateForm = (medico, defaultValues) => {
    let allOK = true;
    let updated = { ...medico };

    // 1. Validación de campos requeridos + horarios inválidos
    for (const [key, value] of Object.entries(medico)) {
        let isNotValid = false;
        let errorCode = null;

        if (value?.requerido && (value.dato === "" || value.dato === null)) {
            isNotValid = true;
            errorCode = "required";
        }

        if (key.startsWith("horarioatencion_") && value?.dato) {
            const asDayjs = dayjs(value.dato).second(0).millisecond(0);
            if (!asDayjs.isValid()) {
                isNotValid = true;
                errorCode = "invalidDate";
            } else if (defaultValues?.minTime && defaultValues?.maxTime) {
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

    // 2. Validación de pares inicio–fin por día
    Object.keys(DAYSMAP).forEach(dayKey => {
        const iniKey = `horarioatencion_${dayKey}_inicio`;
        const finKey = `horarioatencion_${dayKey}_fin`;

        let inicio = updated[iniKey]?.dato ?? null;
        let fin = updated[finKey]?.dato ?? null;

        const mismatch = (inicio && !fin) || (!inicio && fin);

        if (mismatch) {
            allOK = false;
            updated[iniKey].error = true;
            updated[finKey].error = true;
            updated[iniKey].errorCode = "pairMismatch";
            updated[finKey].errorCode = "pairMismatch";
        } else if (inicio && fin) {
            const iniDay = dayjs(inicio);
            const finDay = dayjs(fin);
            if (iniDay.isAfter(finDay)) {
                allOK = false;
                updated[iniKey].error = true;
                updated[finKey].error = true;
                updated[iniKey].errorCode = "invalidRange";
            }
        }
    });

    // 3. Validación: al menos un día completo
    const tieneAlMenosUnDia = Object.keys(DAYSMAP).some(dayKey => {
        const iniKey = `horarioatencion_${dayKey}_inicio`;
        const finKey = `horarioatencion_${dayKey}_fin`;
        return updated[iniKey]?.dato && updated[finKey]?.dato && !updated[iniKey].error;
    });

    if (!tieneAlMenosUnDia) {
        allOK = false;
        Object.keys(DAYSMAP).forEach(dayKey => {
            if (!updated[`horarioatencion_${dayKey}_inicio`].dato) {
                updated[`horarioatencion_${dayKey}_inicio`].error = true;
                updated[`horarioatencion_${dayKey}_inicio`].errorCode = "noWorkingDay";
            }
        });
    }

    return { allOK, updated };
};

/**
 * Submit principal 
 * Recibe setSnackData por parámetro para evitar errores de Hook
 */
export const SubmitForm = (medico, setMedico, idMedicoMod, setSaving, defValues, navigate, setSnackData) => {
    
    return async (event) => {
        if (event) event.preventDefault();
        
        const { allOK, updated } = validateForm(medico, defValues);
        setMedico(updated);

        if (allOK) {
            setSaving(true);
            
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
                        duration: 3000,
                        type: 'success',
                        message: 'Guardado correctamente. Redirigiendo...',
                        open: true,
                    });

                    setTimeout(() => {
                        if (navigate) navigate('/medicos');
                    }, 1500);

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