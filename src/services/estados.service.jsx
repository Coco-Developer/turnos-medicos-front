import api from "./auth.service"; // Instancia centralizada y blindada

//------------------------------------------------------------------------------
// Listar todos los estados
export const listarEstados = async () => {
    try {
        const response = await api.get('/Estado');
        return response.data;
    } catch (error) {
        console.error('Error obteniendo datos de Estados: ', error);
        return {
            status: error.response?.status || 500,
            statusText: error.response?.data?.message || 'Error al conectar con el servidor'
        };
    }
};

//------------------------------------------------------------------------------
// Obtener un estado por ID
export const obtenerEstado = async (id) => {
    try {
        const response = await api.get(`/Estado/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error obteniendo datos de un Estado: ', error);
        return {
            status: error.response?.status || 500,
            statusText: error.response?.data?.message || 'Estado no encontrado'
        };
    }
};

//------------------------------------------------------------------------------
// Crear un nuevo estado
export const crearEstado = async (estado) => {
    try {
        return await api.post('/Estado', estado);
    } catch (error) {
        console.error(`Error creando registro de Estado: (${error.response?.status})`);
        return {
            status: error.response?.status || 500,
            statusText: error.response?.data?.message || 'Error al crear el estado'
        };
    }
};

//------------------------------------------------------------------------------
// Modificar un estado existente
export const modificarEstado = async (id, estado) => {
    try {
        return await api.put(`/Estado/${id}`, estado);
    } catch (error) {
        console.error(`Error actualizando registro de Estado: (${error.response?.status})`, error);
        return {
            status: error.response?.status || 500,
            statusText: error.response?.data?.message || 'Error al actualizar el estado'
        };
    }
};

//------------------------------------------------------------------------------
// Borrar un estado por ID
export const borrarEstado = async (id) => {
    try {
        return await api.delete(`/Estado/${id}`);
    } catch (error) {
        console.error('Error borrando registro de Estado: ', error);
        return {
            status: error.response?.status || 500,
            statusText: error.response?.data?.message || 'Error al borrar el estado'
        };
    }
};