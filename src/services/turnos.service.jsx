import api from "./auth.service";

/**
 * Manejador de errores estandarizado.
 * Mantiene tu lógica pero asegura que el status siempre exista para evitar errores de JS.
 */
const handleError = (error) => ({
    status: error.response?.status || 500,
    statusText: error.response?.data?.message || 'Error de comunicación con el servidor de Turnos'
});

// --- FUNCIONES CORE ---

export const listarTurnos = async () => {
    try {
        const response = await api.get('/Turno');
        return response.data;
    } catch (error) { return handleError(error); }
};

export const obtenerTurno = async (id) => {
    try {
        const response = await api.get(`/Turno/${id}`);
        return response.data;
    } catch (error) { return handleError(error); }
};

export const crearTurno = async (turno) => {
    try {
        // El interceptor inyecta X-API-KEY y Authorization
        return await api.post('/Turno', turno);
    } catch (error) {
        // LÓGICA CRÍTICA: Si el turno se creó pero falló el envío del mail, 
        // no queremos que el usuario vea un error catastrófico.
        if (error.response?.data === 'Failure sending mail.') {
            console.warn("Turno creado, pero hubo un problema enviando el correo de notificación.");
            return { status: 201, statusText: 'Created with mail warning' }; 
        }
        return handleError(error);
    }
};

export const modificarTurno = async (id, turno) => {
    try {
        return await api.put(`/Turno/${id}`, turno);
    } catch (error) { return handleError(error); }
};

export const borrarTurno = async (id) => {
    try {
        return await api.delete(`/Turno/${id}`);
    } catch (error) { return handleError(error); }
};

// --- FILTROS ESPECÍFICOS ---

export const listarTurnosDeFecha = async (dte) => {
    try {
        const response = await api.get(`/Turno/get-turnos-of-date/${dte}`);
        return response.data;
    } catch (error) { return handleError(error); }
};

export const listarTurnosDeMedico = async (id) => {
    try {
        const response = await api.get(`/Turno/get-by-doctor/${id}`);
        return response.data;
    } catch (error) { return handleError(error); }
};

export const listarTurnosDePaciente = async (id) => {
    try {
        const response = await api.get(`/Turno/get-by-patient/${id}`);
        return response.data;
    } catch (error) { return handleError(error); }
};

export const listarFechasConTurno = async () => {
    try {
        const response = await api.get('/Turno/get-dates-with-appointments');
        return response.data;
    } catch (error) { return handleError(error); }
};

export const modificarEstadoTurno = async (id, estado) => {
    try {
        // Mantiene el formato de query param ?st=
        return await api.put(`/Turno/set-turno-status/${id}?st=${estado}`);
    } catch (error) { return handleError(error); }
};

// --- DASHBOARD Y CALENDARIO ---

export const obtenerDashboardData = async () => {
    try {
        const response = await api.get('/Turno/get-dashboard-data');
        return response.data;
    } catch (error) { 
        return { 
            status: error.response?.status || 500,
            statusText: 'No se pudo cargar la información del dashboard' 
        }; 
    }
};

export const listarCalendarData = async (startStr, endStr) => {
    try {
        const response = await api.get('/Turno/get-calendar-data', {
            params: { start: startStr, end: endStr }
        });
        return response.data;
    } catch (error) { return handleError(error); }
};

// =========================================================
// ALIAS DE COMPATIBILIDAD (Evitan el error de "Pantalla Blanca")
// =========================================================
export const listarTurnosPorMedico = listarTurnosDeMedico;
export const listarTurnosPaciente = listarTurnosDePaciente;