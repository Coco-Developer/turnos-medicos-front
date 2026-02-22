import api from "./auth.service";

// --- HELPERS DE MANEJO DE ERRORES (Para mantener tu lógica actual) ---
const handleError = (error) => ({
    status: error.response?.status,
    statusText: error.response?.data?.message || 'Error de red'
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
        return await api.post('/Turno', turno);
    } catch (error) {
        if (error.response?.data === 'Failure sending mail.') return; 
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
        return await api.put(`/Turno/set-turno-status/${id}?st=${estado}`);
    } catch (error) { return handleError(error); }
};

// --- DASHBOARD Y CALENDARIO ---
export const obtenerDashboardData = async () => {
    try {
        const response = await api.get('/Turno/get-dashboard-data');
        return response.data;
    } catch (error) { return { status: error.response?.status }; }
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
// ALIAS DE COMPATIBILIDAD (Crucial para evitar Pantalla Blanca)
// =========================================================
export const listarTurnosPorMedico = listarTurnosDeMedico;
export const listarTurnosPaciente = listarTurnosDePaciente; // Resuelve el error de PacientesListPage