import api from "./auth.service";

/* =========================================================
   Normalizador de error
========================================================= */

const normalizeError = (error) => ({
    ok: false,
    status: error.response?.status ?? 500,
    message:
        error.response?.data?.message ||
        error.response?.data ||
        "Error de comunicación con el servidor"
});

/* =========================================================
   CRUD
========================================================= */

export const listarPacientes = async () => {
    try {
        const { data } = await api.get("/Paciente");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
};

export const obtenerPaciente = async (id) => {
    try {
        if (!id) return null;

        const { data } = await api.get(`/Paciente/${id}`);
        return data ?? null;
    } catch {
        return null;
    }
};

/* =========================================================
   🔒 BUSCAR POR DNI (BLINDADO)
========================================================= */

export const obtenerPacientePorDNI = async (dni) => {
    try {
        // 🚫 No llamar backend si está vacío o incompleto
        if (!dni || String(dni).trim().length < 6) {
            return null;
        }

        const { data } = await api.get("/Paciente/get-dni", {
            params: { dni: String(dni).trim() }
        });

        return data ?? null;

    } catch (error) {
        if (error.response?.status === 404) {
            return null; // paciente no encontrado
        }

        console.error("Error buscando paciente por DNI:", error);
        return null;
    }
};

export const crearPaciente = async (paciente) => {
    try {
        const response = await api.post("/Paciente", paciente);
        return { ok: true, status: response.status };
    } catch (error) {
        return normalizeError(error);
    }
};

export const modificarPaciente = async (id, paciente) => {
    try {
        const response = await api.put(`/Paciente/${id}`, paciente);
        return { ok: true, status: response.status };
    } catch (error) {
        return normalizeError(error);
    }
};

export const borrarPaciente = async (id) => {
    try {
        const response = await api.delete(`/Paciente/${id}`);
        return { ok: true, status: response.status };
    } catch (error) {
        return normalizeError(error);
    }
};

export const cantidadPacientes = async () => {
    try {
        const { data } = await api.get("/Paciente/get-qty");
        return typeof data === "number" ? data : 0;
    } catch {
        return 0;
    }
};