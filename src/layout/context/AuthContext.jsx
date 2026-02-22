import { createContext, useContext, useEffect, useState } from "react";
// Importante: Verifica que las rutas de importación coincidan con tu nueva estructura
import { cargarToken } from "../../services/auth.service"; 
import { setupInterceptor } from "../../services/auth.interceptor"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        sessionStorage.removeItem("authCM");
        sessionStorage.removeItem("userCM");
        cargarToken(setIsAuthenticated, false);
        setUser(null);
    };

    // Al montar, configuramos el interceptor y recuperamos sesión
    useEffect(() => {
        // Inicializamos el interceptor pasando la función logout
        setupInterceptor(logout);

        const token = sessionStorage.getItem("authCM");
        const userInfo = sessionStorage.getItem("userCM");

        if (token) {
            cargarToken(setIsAuthenticated, token);
            try {
                if (userInfo) {
                    const parsedUser = JSON.parse(userInfo);
                    setUser(parsedUser);
                }
            } catch (e) {
                console.warn("Datos de usuario corruptos, limpiando sesión");
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (token, userData) => {
        sessionStorage.setItem("userCM", JSON.stringify(userData));
        sessionStorage.setItem("authCM", token);
        setUser(userData);
        cargarToken(setIsAuthenticated, token);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
            {!loading && children} 
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);