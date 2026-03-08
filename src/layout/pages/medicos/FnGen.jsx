import dayjs from "dayjs";
import { crearMedico, modificarMedico } from "../../../services/medicos.service";
import { DAYSMAP } from "../../libs/constants";

export const handleValidation = (estadoLocal, setMedico) => (e) => {
    const { name, value } = e.target;
    const isValid = value !== "";

    setMedico((prev) => ({
        ...prev,
        [name]: {
            ...prev[name],
            error: !isValid
        }
    }));

    return isValid;
};

const validateForm = (medico, defaultValues) => {
    let allOK = true;
    const updated = { ...medico };

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

    Object.keys(DAYSMAP).forEach((dayKey) => {
        const iniKey = `horarioatencion_${dayKey}_inicio`;
        const finKey = `horarioatencion_${dayKey}_fin`;

        const inicio = updated[iniKey]?.dato ?? null;
        const fin = updated[finKey]?.dato ?? null;

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
                updated[finKey].errorCode = "invalidRange";
            }
        }
    });

    const tieneAlMenosUnDia = Object.keys(DAYSMAP).some((dayKey) => {
        const iniKey = `horarioatencion_${dayKey}_inicio`;
        const finKey = `horarioatencion_${dayKey}_fin`;
        return updated[iniKey]?.dato && updated[finKey]?.dato && !updated[iniKey].error;
    });

    if (!tieneAlMenosUnDia) {
        allOK = false;
        Object.keys(DAYSMAP).forEach((dayKey) => {
            if (!updated[`horarioatencion_${dayKey}_inicio`].dato) {
                updated[`horarioatencion_${dayKey}_inicio`].error = true;
                updated[`horarioatencion_${dayKey}_inicio`].errorCode = "noWorkingDay";
            }
        });
    }

    return { allOK, updated };
};

export const SubmitForm = (medico, setMedico, idMedicoMod, setSaving, defValues, navigate, setSnackData) => {
    return async (event) => {
        if (event) event.preventDefault();

        const { allOK, updated } = validateForm(medico, defValues);
        setMedico(updated);

        if (!allOK) {
            setSnackData({
                type: "error",
                message: "Verifique los campos marcados en rojo.",
                open: true
            });
            return;
        }

        setSaving(true);

        const horarios = [];
        const idNum = Number.parseInt(idMedicoMod, 10) || 0;
        const especialidadNum = Number.parseInt(updated.especialidadid.dato, 10);
        const fechaAlta = dayjs(updated.fechaaltalaboral.dato).format("YYYY-MM-DD");

        const isCreate = idNum === 0;

        const medDto = {
            Id: idNum,
            Apellido: updated.apellido.dato,
            Nombre: updated.nombre.dato,
            Telefono: updated.telefono.dato,
            Direccion: updated.direccion.dato,
            Dni: updated.dni.dato,
            EspecialidadId: especialidadNum,
            FechaAltaLaboral: fechaAlta,
            Matricula: updated.matricula.dato,
            Horarios: horarios
        };

        if (isCreate) {
            medDto.Foto = updated.foto.dato || null;
        }

        Object.keys(DAYSMAP).forEach((dayKey) => {
            const ini = updated[`horarioatencion_${dayKey}_inicio`].dato;
            const fin = updated[`horarioatencion_${dayKey}_fin`].dato;

            if (ini && fin) {
                const iniStr = dayjs(ini).format("HH:mm:00");
                const finStr = dayjs(fin).format("HH:mm:00");

                horarios.push({
                    MedicoId: idNum,
                    DiaSemana: DAYSMAP[dayKey],
                    HorarioAtencionInicio: iniStr,
                    HorarioAtencionFin: finStr
                });
            }
        });

        try {
            const response = isCreate
                ? await crearMedico(medDto)
                : await modificarMedico(idNum, medDto);

            setSaving(false);

            if (response?.status === 200 || response?.status === 201) {
                setSnackData({
                    duration: 3000,
                    type: "success",
                    message: "Guardado correctamente. Redirigiendo...",
                    open: true
                });
                setTimeout(() => {
                    if (navigate) navigate("/medicos");
                }, 1500);
                return;
            }

            setSnackData({
                type: "error",
                message: response?.statusText || "Error al guardar",
                open: true
            });
        } catch (error) {
            setSaving(false);
            setSnackData({
                type: "error",
                message: error?.response?.data?.message || error?.response?.data || "Error de conexion con el servidor",
                open: true
            });
        }
    };
};
