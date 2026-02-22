import api from "./auth.service";

const handleError = (error) => ({
    status: error.response?.status,
    statusText: error.response?.data?.message || 'Error de red'
});

export const listarPacientes = async () => {
    try {
        const response = await api.get('/Paciente');
        return response.data;
    } catch (error) { return handleError(error); }
};

export const obtenerPaciente = async (id) => {
    try {
        const response = await api.get(`/Paciente/${id}`);
        return response.data;
    } catch (error) { return handleError(error); }
};

export const obtenerPacientePorDNI = async (dni) => {
    try {
        const response = await api.get(`/Paciente/get-dni?dni=${dni}`);
        return response.data;
    } catch (error) { return handleError(error); }
};

export const crearPaciente = async (paciente) => {
    try {
        return await api.post('/Paciente', paciente);
    } catch (error) { return handleError(error); }
};

export const modificarPaciente = async (id, paciente) => {
    try {
        return await api.put(`/Paciente/${id}`, paciente);
    } catch (error) { return handleError(error); }
};

export const borrarPaciente = async (id) => {
    try {
        return await api.delete(`/Paciente/${id}`);
    } catch (error) { return handleError(error); }
};

export const cantidadPacientes = async () => {
    try {
        const response = await api.get('/Paciente/get-qty');
        return response.data;
    } catch (error) { return { status: error.response?.status }; }
};