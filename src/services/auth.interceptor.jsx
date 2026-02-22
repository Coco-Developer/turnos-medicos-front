import api from "./auth.service"; // Importamos nuestra instancia centralizada

export const setupInterceptor = (logout) => {
    // Aplicamos el interceptor a nuestra instancia personalizada 'api'
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            // Verificamos si es un error de autorización (401)
            // Agregamos el operador opcional ?. para evitar errores si la respuesta es nula
            if (error.response?.status === 401) {
                console.warn("Sesión expirada o no autorizada. Cerrando sesión...");
                
                // Ejecutamos la función de logout que viene del AuthContext
                logout();
            }
            return Promise.reject(error);
        }
    );
};