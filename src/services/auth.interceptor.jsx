import api from "./auth.service";

/**
 * Configura la respuesta para manejar errores de autenticación globalmente.
 */
export const setupInterceptor = (logout) => {
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            // 401: Token expirado | 403: No es Admin
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.warn("Sesión expirada o no autorizada. Limpiando credenciales...");
                
                // Limpiamos todas las llaves que vimos en tu captura
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('authCM');
                sessionStorage.removeItem('userCM');
                
                logout();
            }
            return Promise.reject(error);
        }
    );
};