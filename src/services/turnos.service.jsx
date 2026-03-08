import api from "./auth.service";
import dayjs from "dayjs";

/**
 * Normaliza error HTTP
 */
const normalizeError = (error) => ({
    ok: false,
    status: error.response?.status ?? 500,
    message:
        error.response?.data?.message ||
        error.response?.data ||
        "Error de comunicacion con el servidor"
});

/* =========================================================
   CORE CRUD
========================================================= */

export const listarTurnos = async () => {
    try {
        const { data } = await api.get("/Turno");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
};

export const obtenerTurno = async (id) => {
    try {
        const { data } = await api.get(`/Turno/${id}`);
        return data ?? null;
    } catch {
        return null;
    }
};

export const crearTurno = async (turno) => {
    try {
        const response = await api.post("/Turno", turno);
        return {
            ok: true,
            status: response.status,
            message: "Turno creado correctamente"
        };
    } catch (error) {
        const rawData = error.response?.data;
        const message =
            rawData?.message ||
            (typeof rawData === "string" ? rawData : "");

        if (
            message === "Failure sending mail." ||
            message.includes("Value cannot be null. (Parameter 'address')")
        ) {
            return {
                ok: true,
                status: 201,
                message: "Turno creado (sin envio de mail)"
            };
        }

        return normalizeError(error);
    }
};

export const modificarTurno = async (id, turno) => {
    try {
        const response = await api.put(`/Turno/${id}`, turno);
        return { ok: true, status: response.status };
    } catch (error) {
        return normalizeError(error);
    }
};

export const borrarTurno = async (id) => {
    try {
        const response = await api.delete(`/Turno/${id}`);
        return { ok: true, status: response.status };
    } catch (error) {
        return normalizeError(error);
    }
};

/* =========================================================
   FILTROS
========================================================= */

export const listarTurnosDeFecha = async (fecha) => {
    try {
        const fechaISO = dayjs(fecha).format("YYYY-MM-DD");
        const { data } = await api.get(`/Turno/get-by-date/${fechaISO}`);
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
};

export const listarTurnosDeMedico = async (id) => {
    try {
        // Endpoint nuevo con vista completa
        const { data } = await api.get(`/Turno/get-turnos-of-doctor-vw/${id}`);
        return Array.isArray(data) ? data : [];
    } catch {
        // Fallback de compatibilidad por si aún no está desplegado el endpoint nuevo
        try {
            const { data } = await api.get(`/Turno/get-turnos-of-doctor/${id}`);
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }
};

export const listarTurnosDePaciente = async (id) => {
    try {
        // Endpoint correcto del backend
        const { data } = await api.get(`/Turno/get-turnos-by-patient/${id}`);
        return Array.isArray(data) ? data : [];
    } catch {
        // Fallback de compatibilidad si quedó publicado el alias viejo
        try {
            const { data } = await api.get(`/Turno/get-by-patient/${id}`);
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }
};

export const listarFechasConTurno = async (mes) => {
    try {
        const { data } = await api.get(`/Turno/get-dates-with-shifts/${mes}`);
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
};

export const modificarEstadoTurno = async (id, estado) => {
    try {
        const response = await api.put(`/Turno/set-turno-status/${id}?st=${estado}`);
        return { ok: true, status: response.status };
    } catch (error) {
        return normalizeError(error);
    }
};

/* =========================================================
   DASHBOARD
========================================================= */

export const obtenerDashboardData = async () => {
    try {
        const { data } = await api.get("/Turno/get-dashboard-data");
        return data ?? null;
    } catch {
        return null;
    }
};

/* =========================================================
   CALENDARIO
========================================================= */

export const listarCalendarData = async (startStr, endStr) => {
    try {
        const { data } = await api.get("/Turno/get-calendar-data", {
            params: { start: startStr, end: endStr }
        });
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
};

/* =========================================================
   ALIAS COMPATIBILIDAD
========================================================= */

export const listarTurnosPorMedico = listarTurnosDeMedico;
export const listarTurnosPaciente = listarTurnosDePaciente;
