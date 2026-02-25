import axios from "axios";

// 1. Instancia base configurada con la URL de Azure
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
});

/**
 * INTERCEPTOR DE PETICIONES (Request)
 * Este bloque es el encargado de que Azure no te rechace como "Anonymous".
 */
api.interceptors.request.use((config) => {
    // Inyectar la API KEY desde el .env (Debe coincidir con AllowedApiKeys en Azure)
    config.headers['X-API-KEY'] = import.meta.env.VITE_AUTH_TOKEN;

    // Recuperamos el token de las llaves que identificamos en tu SessionStorage
    const storedToken = sessionStorage.getItem('authCM') || sessionStorage.getItem('token'); 
    
    // Solo inyectamos el header Authorization si el token existe y es válido
    if (storedToken && storedToken !== "undefined" && storedToken !== "null") {
        // Limpiamos comillas dobles (evita errores de parseo en el backend .NET)
        const cleanToken = storedToken.replace(/"/g, '').trim(); 
        config.headers['Authorization'] = `Bearer ${cleanToken}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// --- FUNCIONES DE ACCIÓN ---

/**
 * Guarda el token en el storage y actualiza el estado de autenticación.
 */
export const cargarToken = (callback, token) => {
    if (token) {
        // Guardamos en ambas llaves para asegurar compatibilidad total
        sessionStorage.setItem('token', token); 
        sessionStorage.setItem('authCM', token); 
        callback(true);
    } else {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('authCM');
        sessionStorage.removeItem('userCM');
        callback(false);
    }
};

/**
 * Realiza el login y valida que el usuario sea ADMIN.
 */
export const obtenerLoginToken = async (username, password) => {
    try {
        // Realizamos la petición (el interceptor ya pone la X-API-KEY)
        const response = await api.post('/Auth/login', { username, password });
        
        // Validación de Rol estricta para el panel administrativo
        if (response.data.rol?.toUpperCase() === 'ADMIN') {
            return response.data;
        } else {
            return {
                status: 403,
                statusText: 'Acceso denegado: Se requieren permisos de Administrador.'
            };
        }
    } catch (error) {
        console.error('Error en proceso de Login: ', error);
        return {
            status: error.response?.status || 500,
            statusText: error.response?.data?.message || 'Error crítico de servidor'
        };
    }
};

/**
 * Recuperación de contraseña enviando el nombre de usuario.
 */
export const enviarCorreoRecuperacion = async (username) => {
    try {
        const response = await api.post('/Auth/forgot-password', `"${username}"`, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || 'Error al solicitar recuperación');
    }
};

/**
 * Cambio de contraseña usando FormData para el backend.
 */
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

export default api;