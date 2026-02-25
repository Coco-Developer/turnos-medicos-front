import api from "./auth.service"; // Instancia centralizada con interceptores

//------------------------------------------------------------------------------
// Listar todas las especialidades
export const listarEspecialidades = async () => {
    try {
        const response = await api.get('/Especialidad');
        return response.data;
    } catch (error) {
        console.error('Error obteniendo datos de Especialidades: ', error);
        return {
            status: error.response?.status || 500,
            statusText: error.response?.data?.message || 'Error al obtener especialidades'
        };
    }
};

//------------------------------------------------------------------------------
// Listar especialidades que tienen médicos asignados
export const listarEspecialidadesCubiertas = async () => {
    try {
        const response = await api.get('/Especialidad/list-covered-specialty/');
        return response.data;
    } catch (error) {
        console.error('Error obteniendo especialidades cubiertas: ', error);
        return {
            status: error.response?.status || 500,
            statusText: error.response?.data?.message || 'Error al obtener especialidades cubiertas'
        };
    }
};

//------------------------------------------------------------------------------
// Obtener una especialidad por ID
export const obtenerEspecialidad = async (id) => {
    try {
        const response = await api.get(`/Especialidad/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error obteniendo datos de la Especialidad: ', error);
        return {
            status: error.response?.status || 500,
            statusText: error.response?.data?.message || 'Especialidad no encontrada'
        };
    }
};

//------------------------------------------------------------------------------
// Crear una nueva especialidad
export const crearEspecialidad = async (especialidad) => {
    try {
        // No es necesario pasar headers manuales, el interceptor inyecta X-API-KEY y Authorization
        return await api.post('/Especialidad', especialidad);
    } catch (error) {
        console.error(`Error creando registro de Especialidad: (${error.response?.status})`);
        return {
            status: error.response?.status || 500,
            statusText: error.response?.data?.message || 'Error al crear la especialidad'
        };
    }
};

//------------------------------------------------------------------------------
// Modificar una especialidad existente
export const modificarEspecialidad = async (id, especialidad) => {
    try {
        return await api.put(`/Especialidad/${id}`, especialidad);
    } catch (error) {
        console.error(`Error actualizando registro de Especialidad: (${error.response?.status})`, error);
        return {
            status: error.response?.status || 500,
            statusText: error.response?.data?.message || 'Error al actualizar la especialidad'
        };
    }
};

//------------------------------------------------------------------------------
// Borrar una especialidad por ID
export const borrarEspecialidad = async (id) => {
    try {
        return await api.delete(`/Especialidad/${id}`);
    } catch (error) {
        console.error('Error borrando registro de Especialidad: ', error);
        return {
            status: error.response?.status || 500,
            statusText: error.response?.data?.message || 'Error al borrar la especialidad'
        };
    }
};