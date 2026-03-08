import api from "./auth.service";

const extractErrorMessage = (error, fallback) => {
    const raw = error?.response?.data;
    if (typeof raw === "string" && raw.trim()) return raw;
    if (raw?.message) return raw.message;
    if (raw?.error) return raw.error;
    if (raw?.title) return raw.title;
    return fallback;
};

export const listarMedicos = async () => {
    const response = await api.get("/Medico");
    return response.data;
};

export const listarMedicosPorEspecialidad = async (id) => {
    try {
        const response = await api.get(`/Medico/list-for-specialty/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error obteniendo medicos por especialidad:", error);
        return {
            status: error.response?.status,
            statusText: extractErrorMessage(error, "Error al obtener medicos por especialidad")
        };
    }
};

export const obtenerMedico = async (id) => {
    try {
        const response = await api.get(`/Medico/${id}?t=${Date.now()}`);
        return response.data;
    } catch (error) {
        console.error("Error obteniendo medico:", error);
        return {
            status: error.response?.status,
            statusText: extractErrorMessage(error, "Error al obtener medico")
        };
    }
};

export const crearMedico = async (medico) => {
    try {
        return await api.post("/Medico", medico);
    } catch (error) {
        console.error(`Error creando medico: (${error.response?.status})`, error);
        return {
            status: error.response?.status,
            statusText: extractErrorMessage(error, "Error al crear medico")
        };
    }
};

export const modificarMedico = async (id, medico) => {
    try {
        return await api.put(`/Medico/${id}`, medico);
    } catch (error) {
        const raw = error?.response?.data;
        const detailed = typeof raw === "string" ? raw : JSON.stringify(raw);
        return {
            status: error?.response?.status,
            statusText: detailed || extractErrorMessage(error, "Error interno al actualizar medico")
        };
    }

};

export const borrarMedico = async (id) => {
    try {
        const res = await api.delete(`/Medico/${id}`);
        return res.data || "1";
    } catch (error) {
        return {
            status: error.response?.status,
            statusText: extractErrorMessage(error, "Error al eliminar")
        };
    }
};

export const cantidadMedicos = async () => {
    try {
        const response = await api.get("/Medico/get-qty");
        return response.data;
    } catch (error) {
        console.error("Error obteniendo cantidad de medicos:", error);
        return {
            status: error.response?.status,
            statusText: extractErrorMessage(error, "Error al obtener cantidad de medicos")
        };
    }
};

export const obtenerHorarioMedico = async (id) => {
    try {
        const response = await api.get(`/Medico/get-schedule/${id}?t=${Date.now()}`);
        return response.data;
    } catch (error) {
        console.error("Error obteniendo horario medico:", error);
        return null;
    }
};
