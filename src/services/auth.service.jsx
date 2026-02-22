import axios from "axios";

// Creamos una instancia de axios para no repetir la URL base
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
});

// Interceptor para inyectar la API KEY automáticamente en cada petición
api.interceptors.request.use((config) => {
    config.headers['X-API-KEY'] = import.meta.env.VITE_AUTH_TOKEN;
    return config;
});

export const cargarToken = (callback, token) => {
    if (token) {
        // Configuramos el token de Bearer para futuras peticiones
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        callback(true);
    } else {
        delete api.defaults.headers.common["Authorization"];
        callback(false);
    }
};

export const obtenerLoginToken = async (username, password) => {
    try {
        const response = await api.post('/Auth/login', { username, password });
        
        if (response.data.rol.toUpperCase() === 'ADMIN') {
            return response.data;
        } else {
            return {
                status: 401,
                statusText: 'El usuario no cuenta con los permisos adecuados'
            };
        }
    } catch (error) {
        console.error('Error de credenciales: ', error);
        return {
            status: error.response?.status || 500,
            statusText: error.message
        };
    }
};

export const enviarCorreoRecuperacion = async (username) => {
    try {
        const response = await api.post('/Auth/forgot-password', `"${username}"`, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || 'Error al recuperar');
    }
};

export const cambiarPassword = async (actualPassword, nuevoPassword) => {
    try {
        const formData = new FormData();
        formData.append("actualPassword", actualPassword);
        formData.append("nuevoPassword", nuevoPassword);

        return await api.post('/Auth/new-password', formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    } catch (error) {
        throw error;
    }
};

export default api; // Exportamos la instancia configurada