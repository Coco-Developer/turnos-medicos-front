import dayjs from "dayjs";
import { crearTurno, modificarTurno, obtenerTurno } from "../../../services/turnos.service";
import { DATE_FORMAT } from "../../libs/constants";

const validateForm = (turno, setTurno, handleFecChange, hoy) => {
    let allOK = true;
    const nextTurno = { ...turno };

    for (const [key, value] of Object.entries(turno)) {
        if (!value?.requerido) continue;

        const isEmpty = value.dato === "" || value.dato === null || value.dato === undefined;
        nextTurno[key] = { ...value, error: isEmpty };

        if (isEmpty) allOK = false;
    }

    if (!nextTurno.fecha?.dato) {
        handleFecChange(hoy);
    }

    setTurno(nextTurno);
    return allOK;
};

export const SubmitForm = (
    turno,
    setTurno,
    handleFecChange,
    hoy,
    idTurnoMod,
    setSaving,
    setSnackData,
    validateTurnoData
) => {
    return async (event) => {
        event.preventDefault();

        const isValid = validateForm(turno, setTurno, handleFecChange, hoy);
        if (!isValid) {
            setSnackData({
                type: "error",
                message: "Verifique los campos marcados en rojo.",
                open: true
            });
            return;
        }

        if (typeof validateTurnoData === "function") {
            const validationMessage = validateTurnoData();
            if (validationMessage) {
                setSnackData({
                    type: "error",
                    message: validationMessage,
                    open: true
                });
                return;
            }
        }

        setSaving(true);

        const trn = {};
        for (const [key, value] of Object.entries(turno)) {
            trn[key] = value?.dato ?? null;
        }

        trn.fecha = dayjs(trn.fecha || hoy).format(DATE_FORMAT);
        trn.hora = dayjs(trn.hora).format("HH:mm:00");

        const result = idTurnoMod === 0
            ? await crearTurno(trn)
            : await modificarTurno(idTurnoMod, trn);

        setSaving(false);

        if (result?.ok && (result.status === 200 || result.status === 201)) {
            setSnackData({
                duration: 6000,
                type: "success",
                message: idTurnoMod === 0
                    ? "Guardado correctamente. Volviendo a Lista..."
                    : "Actualizado correctamente. Volviendo a Lista...",
                open: true,
                action: idTurnoMod === 0 ? "alta" : "mod",
                href: "/turnos"
            });
            return;
        }

        setSnackData({
            type: "error",
            message: result?.message ?? "Hubo un error al guardar. Vuelva a intentarlo.",
            open: true
        });
    };
};

export const cargarTurno = async (id, datosIniciales) => {
    if (id === 0) return null;

    const r = await obtenerTurno(id);
    if (!r) return null;

    const trn = { ...datosIniciales };
    const dat = {
        fecha: { dato: dayjs(r.fecha).toDate() },
        hora: { dato: dayjs(`${dayjs(r.fecha).format(DATE_FORMAT)} ${r.hora}`).toDate() },
        medicoid: { dato: r.medicoId ?? "" },
        pacienteid: { dato: r.pacienteId ?? "" },
        dni: { dato: r.pacienteDni ?? "" },
        estadoid: { dato: r.estadoId ?? 1 },
        observaciones: { dato: r.observaciones ?? "" }
    };

    for (const key of Object.keys(trn)) {
        trn[key] = { ...trn[key], ...(dat[key] || {}) };
    }

    return {
        turno: trn,
        especialidadId: r.especialidadId ?? "",
        medicoId: r.medicoId ?? "",
        paciente: {
            id: r.pacienteId ?? null,
            nombre: r.paciente ?? "",
            apellido: "",
            dni: r.pacienteDni ?? ""
        }
    };
};
