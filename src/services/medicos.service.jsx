import api from "./auth.service"; // Instancia con Interceptor de API KEY y BaseURL

//------------------------------------------------------------------------------
export const listarMedicos = async () => {
    try {
        const response = await api.get('/Medico/get-all-doctors');
        console.log('listarMedicos', response.data);
        return response.data;
    } catch (error) {
        console.error('Error obteniendo datos de Médicos: ', error);
        return {
            status: error.response?.status,
            statusText: error.response?.data?.message || 'Error de conexión'
        };
    }
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
        return await api.delete(`/Medico/${id}`);
    } catch (error) {
        console.error('Error borrando registro de Médico: ', error);
        return {
            status: error.response?.status,
            statusText: error.response?.data?.message
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
        const response = await api.get(`/Medico/get-schedule/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error obteniendo horario Médico: ', error);
        return {
            status: error.response?.status,
            statusText: error.response?.data?.message || error.response?.data?.errorMessage
        };
    }
};