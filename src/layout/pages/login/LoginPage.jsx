import { useState } from 'react';
import {
    InputAdornment,
    styled,
    TextField,
    Snackbar,
    Alert,
    Box,
    Grid,
    Typography,
    Button,
    CircularProgress
} from "@mui/material";
import {
    faRightToBracket,
    faUser,
    faKey,
    faEyeSlash,
    faEye
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

// Contextos y Servicios
import { useAuth } from "../../context/AuthContext";
import { useSnack } from "../../context/SnackContext";
import { obtenerLoginToken } from "../../../services/auth.service";

// Assets y Estilos
import "../../../assets/login.css";

const LoginTextField = styled(TextField)({
    '& label': {
        color: 'var(--mui-palette-primary-main, #007c6a)'
    },
    '& label.Mui-focused': {
        color: '#fff'
    },
    '& .MuiFilledInput-root': {
        color: '#fff',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    },
    '& .MuiFilledInput-root:before': {
        borderBottomColor: 'var(--mui-palette-primary-main, #007c6a)'
    },
    '& .MuiFilledInput-root:hover::before': {
        borderBottomColor: 'var(--mui-palette-primary-main, #007c6a) !important'
    },
    '& .MuiFilledInput-root:after': {
        borderBottomColor: '#fff'
    },
    '& .MuiInputAdornment-root': {
        color: 'var(--mui-palette-primary-main, #007c6a)'
    },
    '& .Mui-focused .MuiInputAdornment-root': {
        color: '#fff'
    },
});

const LoginPage = () => {
    const { login } = useAuth();
    const { snackData, setSnackData } = useSnack();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSnackClose = () => setSnackData({ ...snackData, open: false });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setSnackData({
                type: 'error',
                message: 'Por favor, complete usuario y contraseña',
                open: true,
            });
            return;
        }

        setLoading(true);
        try {
            const r = await obtenerLoginToken(username, password);
            if (r && r.token) {
                login(r.token, { nombre: r.nombre });
            } else {
                setLoading(false);
                setSnackData({
                    type: 'error',
                    message: 'Usuario o contraseña incorrectos',
                    open: true,
                });
            }
        } catch (error) {
            setLoading(false);
            setSnackData({
                type: 'error',
                message: 'Error de conexión con el servidor',
                open: true,
            });
        }
    };

    return (
        <Box className="login-page-wrapper" sx={{ minHeight: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>

            {/* Fondo de Video */}
            <video id="bg-video" src="/bkg-login.mp4" autoPlay loop muted />

            {/* Capa de oscurecimiento necesaria para que el CSS funcione */}
            <div className="login-overlay"></div>

            <div id="main">
                <Grid
                    container
                    justifyContent="center"
                    alignItems="center"
                    sx={{ minHeight: "100vh", width: "100%", m: 0, p: { xs: 2, sm: 0 } }}
                >
                    <Grid item xs={12} sm={8} md={5} lg={3.5}>
                        <Box className="login-box-container">

                            <Box className="login-header" sx={{ textAlign: 'center', mb: 4 }}>
                                {/* src directo a public para asegurar carga */}
                                <img src="/logo.png" className="login-logo" alt="Logo ChronoMed" />
                                <Typography variant="h4" className="app-logo-alt">
                                    Chrono<b style={{ fontWeight: 700 }}>Med</b>
                                </Typography>
                            </Box>

                            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                                <LoginTextField
                                    required
                                    fullWidth
                                    id="usuario"
                                    label="Usuario"
                                    variant="filled"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    sx={{ mb: 3 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FontAwesomeIcon icon={faUser} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <LoginTextField
                                    required
                                    fullWidth
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    label="Contraseña"
                                    variant="filled"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    sx={{ mb: 4 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FontAwesomeIcon icon={faKey} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <FontAwesomeIcon
                                                    icon={showPassword ? faEyeSlash : faEye}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{ cursor: "pointer" }}
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={loading} // Evita doble click
                                    variant="contained"
                                    color="secondary"
                                    size="large"
                                    sx={{ py: 1.5, fontWeight: 'bold' }}
                                    startIcon={
                                        loading ? (
                                            <CircularProgress size={20} color="inherit" />
                                        ) : (
                                            <FontAwesomeIcon icon={faRightToBracket} />
                                        )
                                    }
                                >
                                    {loading ? "Ingresando..." : "Ingresar"}
                                </Button>

                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => navigate("/recuperar")}
                                        className="forgot-password-btn"
                                        sx={{ textTransform: 'none' }}
                                    >
                                        ¿Olvidó su contraseña?
                                    </Button>
                                </Box>
                            </form>
                        </Box>
                    </Grid>
                </Grid>
            </div>

            <Snackbar
                open={snackData.open}
                autoHideDuration={4000}
                onClose={handleSnackClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackClose} severity={snackData.type} variant="filled" sx={{ width: '100%' }}>
                    {snackData.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LoginPage;