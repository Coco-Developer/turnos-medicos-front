import {createTheme} from "@mui/material/styles";
import {esES} from "@mui/material/locale";

// Algunos colores generados con https://palettegenerator.com/
export const lightTheme = createTheme({
        palette: {
            mode: 'light',
            background: {
                default: "#b8b8b8",
                paper: "#cdcdcd"
            },
            primary: {
                light: '#00af96',
                main: '#007c6a',
                dark: '#004c41',
                contrastText: '#fff',
            },
            secondary: {
                light: '#2a7aeb',
                main: '#003e86',
                dark: '#00205a',
                contrastText: '#fff',
            },
            warning: {
                light: '#ffd405',
                main: '#ffc107',
                dark: '#f69604',
                contrastText: '#451800',
            },
            error: {
                light: '#ff4336',
                main: '#ba3329',
                dark: '#751f19',
                contrastText: '#fff',
            },
            success: {
                main: '#3c763d',
                contrastText: '#fff',
            },
            snackButton:{
                main: '#fff',
                contrastText: '#000',
            },
            base: {
                background: '#dbdeff33',
            }

        },
    },
    esES
);

export const darkTheme = createTheme({
        palette: {
            mode: 'dark',
            background: {
                default: "#121212",
                paper: "#1e1e1e"
            },
            primary: {
                light: '#90f2dc',
                main: '#00af96',
                dark: '#007c6a',
                contrastText: '#000',
            },
            secondary: {
                light: '#9accfd',
                main: '#2a7aeb',
                dark: '#003e86',
                contrastText: '#000',
            },
            warning: {
                light: '#ffd405',
                main: '#ffc107',
                dark: '#f69604',
                contrastText: '#451800',
            },
            error: {
                light: '#ff4336',
                main: '#ba3329',
                dark: '#751f19',
                contrastText: '#fff',
            },
            success: {
                main: '#3c763d',
                contrastText: '#fff',
            },
            snackButton:{
                main: '#333',
                contrastText: '#fff',
            },
            base: {
                background: '#16161a33',
            }
        },
    },
    esES
);