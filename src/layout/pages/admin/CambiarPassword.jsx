import React, { useState } from "react";
import { cambiarPassword } from "../../../services/auth.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faKey, faSave, faLock, faShieldAlt } from "@fortawesome/free-solid-svg-icons";
import { 
    Button, InputAdornment, LinearProgress, Paper, 
    TextField, Box, Typography, Grid, Zoom, styled 
} from "@mui/material";
import { useSnack } from "../../context/SnackContext";

// Replicamos exactamente tu "login-box-container" pero adaptable
const StyledPaper = styled(Paper)(({ theme }) => ({
    width: '100%',
    maxWidth: '450px', // Un poquito más ancho que el login para comodidad
    minHeight: '500px',
    padding: '2.5rem',
    backgroundColor: 'rgba(0, 51, 40, 0.5)', // Tu color exacto
    backdropFilter: 'blur(10px)',
    borderRadius: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
    margin: '0 auto'
}));

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        color: '#fff',
        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
        '&:hover fieldset': { borderColor: '#007c6a' },
        '&.Mui-focused fieldset': { borderColor: '#007c6a' },
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    '& .MuiInputLabel-root': { color: '#fff', opacity: 0.7 },
    '& .MuiInputLabel-root.Mui-focused': { color: '#007c6a', opacity: 1 },
    marginBottom: '1.5rem'
});

const CambiarPasswordPage = () => {
    const { setSnackData } = useSnack();
    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== repeatPassword) {
            setSnackData({ type: 'error', message: "Las contraseñas no coinciden.", open: true });
            return;
        }
        setLoading(true);
        try {
            await cambiarPassword(currentPassword, newPassword);
            setSnackData({ type: 'success', message: '¡Contraseña actualizada!', open: true });
            setCurrentPassword(""); setNewPassword(""); setRepeatPassword("");
        } catch (error) {
            setSnackData({ type: 'error', message: error.response?.data?.message || 'Error de conexión.', open: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Zoom in={true}>
            <Box sx={{ 
                width: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: 4 
            }}>
                {/* Logo y Título Estilo Login */}
                <Box sx={{ textAlign: 'center' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '5rem', marginBottom: '1rem' }} />
                    <Typography variant="h4" className="app-logo-alt" sx={{ 
                        fontWeight: 'bold', 
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                    }}>
                        Seguridad
                    </Typography>
                </Box>

                <StyledPaper elevation={0}>
                    {loading && <LinearProgress sx={{ width: '100%', position: 'absolute', top: 0, borderRadius: '1rem 1rem 0 0', bgcolor: 'transparent', '& .MuiLinearProgress-bar': { bgcolor: '#007c6a' } }} />}
                    
                    <Typography variant="h6" sx={{ color: '#fff', mb: 4, fontWeight: 300, textAlign: 'center' }}>
                        Actualizar Credenciales
                    </Typography>

                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <StyledTextField
                            fullWidth required label="Contraseña Actual"
                            type={showPass ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FontAwesomeIcon icon={faLock} style={{ color: '#007c6a' }} />
                                    </InputAdornment>
                                )
                            }}
                        />

                        <StyledTextField
                            fullWidth required label="Nueva Contraseña"
                            type={showPass ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FontAwesomeIcon icon={faKey} style={{ color: '#007c6a' }} />
                                    </InputAdornment>
                                )
                            }}
                        />

                        <StyledTextField
                            fullWidth required label="Repetir Nueva Contraseña"
                            type={showPass ? "text" : "password"}
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FontAwesomeIcon icon={faShieldAlt} style={{ color: '#007c6a' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <FontAwesomeIcon 
                                            icon={showPass ? faEyeSlash : faEye} 
                                            onClick={() => setShowPass(!showPass)} 
                                            style={{ cursor: 'pointer', color: '#fff', opacity: 0.5 }} 
                                        />
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Button 
                            fullWidth variant="contained" type="submit" 
                            disabled={loading} 
                            sx={{ 
                                mt: 2, py: 1.8, 
                                bgcolor: '#007c6a', 
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                borderRadius: '0.8rem',
                                '&:hover': { bgcolor: '#005d4f' },
                                textTransform: 'none'
                            }}
                        >
                            {loading ? "Guardando..." : "Confirmar Cambio"}
                        </Button>
                    </form>
                </StyledPaper>

                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', mt: 2 }}>
                    La sesión se mantendrá activa tras el cambio.
                </Typography>
            </Box>
        </Zoom>
    );
};

export default CambiarPasswordPage;