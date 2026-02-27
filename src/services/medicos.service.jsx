import api from "./auth.service"; // Instancia con Interceptor de API KEY y BaseURL

//------------------------------------------------------------------------------
export const listarMedicos = async () => {
    const response = await api.get('/Medico');
    return response.data;
};

//------------------------------------------------------------------------------
export const listarMedicosPorEspecialidad = async (id) => {
    try {
        const response = await api.get(`/Medico/list-for-specialty/${id}`);
        // Maneja IActionResult devolviendo el cuerpo de la respuesta
        return response.data;
    } catch (error) {
        console.error('Error obteniendo datos de Médicos por Especialidad: ', error);
        return {
            status: error.response?.status,
            statusText: error.response?.data?.message
        };
    }
};

//------------------------------------------------------------------------------
export const obtenerMedico = async (id) => {
    try {
        const response = await api.get(`/Medico/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error obteniendo datos de un Médico: ', error);
        return {
            status: error.response?.status,
            statusText: error.response?.data?.message
        };
    }
};

//------------------------------------------------------------------------------
export const crearMedico = async (medico) => {
    try {
        return await api.post('/Medico', medico);
    } catch (error) {
        console.error(`Error creando registro de Médico: (${error.response?.status})`);
        return {
            status: error.response?.status,
            statusText: error.response?.data?.message || error.response?.data?.errorMessage
        };
    }
};

//------------------------------------------------------------------------------
export const modificarMedico = async (id, medico) => {
    try {
        return await api.put(`/Medico/${id}`, medico);
    } catch (error) {
        console.error(`Error actualizando registro de Médico: (${error.response?.status})`, error);
        return {
            status: error.response?.status,
            statusText: error.response?.data?.message
        };
    }
};

//------------------------------------------------------------------------------
export const borrarMedico = async (id) => {
    try {
        const res = await api.delete(`/Medico/${id}`);
        return res.data || '1'; 
    } catch (error) {
        // Si el backend responde con error (ej: tiene turnos reales), capturamos el mensaje
        return { 
            status: error.response?.status, 
            statusText: error.response?.data?.message || "Error al eliminar" 
        };
    }
};

//------------------------------------------------------------------------------
export const cantidadMedicos = async () => {
    try {
        const response = await api.get('/Medico/get-qty');
        return response.data;
    } catch (error) {
        console.error('Error obteniendo cantidad de Médicos: ', error);
        return {
            status: error.response?.status,
            statusText: error.response?.data?.message
        };
    }
};

//------------------------------------------------------------------------------
export const obtenerHorarioMedico = async (id) => {
    try {
        // Agregamos timestamp para que el RELOJ sea real siempre
        const response = await api.get(`/Medico/get-schedule/${id}?t=${Date.now()}`);
        return response.data;
    } catch (error) {
        console.error('Error obteniendo horario: ', error);
        return null;
    }
};