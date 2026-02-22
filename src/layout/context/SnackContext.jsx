import { createContext, useState, useContext } from 'react';

// Creamos el contexto
const SnackContext = createContext();

// Proveedor del contexto
export const SnackProvider = ({ children }) => {
    const [snackData, setSnackData] = useState({
        duration: 4000,
        type: 'info',
        message: '',
        open: false,
        action: '',
        href: '/'
    });

    return (
        <SnackContext.Provider value={{ snackData, setSnackData }}>
            {children}
        </SnackContext.Provider>
    );
};

// Hook personalizado para acceder al contexto fácilmente
export const useSnack = () => {
    return useContext(SnackContext);
};
