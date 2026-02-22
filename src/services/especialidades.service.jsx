import api from "./auth.service";

//------------------------------------------------------------------------------
// Listar todas las especialidades
export const listarEspecialidades = async () => {
    try {
        const response = await api.get('/Especialidad');
        return response.data;
    } catch (error) {
        console.error('Error obteniendo datos de Especialidades: ', error);
        return {
            status: error.response?.status,
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
            status: error.response?.status,
            statusText: error.response?.data?.message
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
            status: error.response?.status,
            statusText: error.response?.data?.message
        };
    }
};

//------------------------------------------------------------------------------
// Crear una nueva especialidad
export const crearEspecialidad = async (especialidad) => {
    try {
        return await api.post('/Especialidad', especialidad);
    } catch (error) {
        console.error(`Error creando registro de Especialidad: (${error.response?.status})`);
        return {
            status: error.response?.status,
            statusText: error.response?.data?.message
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
            status: error.response?.status,
            statusText: error.response?.data?.message
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
            status: error.response?.status,
            statusText: error.response?.data?.message
        };
    }
};