import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { ThemeProvider, CssBaseline, GlobalStyles } from "@mui/material";
import { lightTheme, darkTheme } from "../libs/themes";

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeModeProvider = ({ children }) => {
    // Cargar el tema guardado (si existe) o usar "light" por defecto
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem("themeMode");
        return savedMode ? savedMode : "light";
    });

    // Alternar tema y guardar en localStorage
    const toggleTheme = () => {
        setMode((prev) => {
            const newMode = prev === "light" ? "dark" : "light";
            localStorage.setItem("themeMode", newMode);
            return newMode;
        });
    };
    // Esto agrega o quita la clase .dark-theme del body
    useEffect(() => {
        document.body.classList.toggle("dark-theme", mode === "dark");
    }, [mode]);

    // Sincronizar el tema si cambia desde otro tab (opcional)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === "themeMode") {
                setMode(e.newValue);
            }
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const theme = useMemo(() => (mode === "light" ? lightTheme : darkTheme), [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <GlobalStyles
                    styles={{
                        body: {
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.primary,
                            transition: "background-color 0.3s ease, color 0.3s ease",
                        },
                    }}
                />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};
