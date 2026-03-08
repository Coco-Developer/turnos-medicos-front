import React, { useState } from 'react';
import { Box, Typography, Button, InputAdornment, Alert, Snackbar, styled, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUser, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import TextField from '@mui/material/TextField';
import { useSnack } from '../../context/SnackContext';
import { enviarCorreoRecuperacion } from '../../../services/auth.service';

// Estilo de los campos para que se vean sobre el video
const LoginTextField = styled(TextField)({
  '& label': { color: 'var(--mui-palette-primary-main, #007c6a)' },
  '& label.Mui-focused': { color: '#fff' },
  '& .MuiFilledInput-root': {
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Un poco más de opacidad
    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
  },
  '& .MuiFilledInput-root:before': { borderBottomColor: 'var(--mui-palette-primary-main, #007c6a)' },
  '& .MuiFilledInput-root:after': { borderBottomColor: '#fff' },
  '& .MuiInputAdornment-root': { color: 'var(--mui-palette-primary-main, #007c6a)' },
});

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { snackData, setSnackData } = useSnack();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await enviarCorreoRecuperacion(username);
      setResetSent(true);
      setSnackData({ message: "Enlace enviado con éxito.", type: 'success', open: true });
    } catch (err) {
      setSnackData({ message: "No se pudo enviar el correo. Verifica el usuario.", type: 'error', open: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackClose = () => setSnackData({ ...snackData, open: false });

  return (
    <Box className="login-page-wrapper" sx={{ minHeight: '100vh', width: '100vw', position: 'relative' }}>
      
      {/* 1. VIDEO DE FONDO */}
      <video id="bg-video" src="/bkg-login.mp4" autoPlay loop muted 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} 
      />

      {/* 2. OVERLAY OSCURO (Esto evita que se vea blanco) */}
      <Box sx={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1 
      }} />

      {/* 3. CONTENIDO DEL FORMULARIO */}
      <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: "100vh", position: 'relative', zIndex: 2 }}>
        <Grid item xs={11} sm={8} md={5} lg={3.5}>
          <Box className="login-box-container" sx={{ p: 4, borderRadius: 3, backdropFilter: 'blur(10px)' }}>
            
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {/* Logo con fallback por si la variable logo no está definida */}
              <img src="/logo.png" className="login-logo" alt="Logo" style={{ height: '70px', marginBottom: '1rem' }} />
              <Typography variant="h4" className="app-logo-alt" sx={{ color: '#fff', fontWeight: 'bold' }}>
                Chrono<span style={{ color: '#007c6a' }}>Med</span>
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                Recuperación de cuenta
              </Typography>
            </Box>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              {!resetSent ? (
                <>
                  <LoginTextField
                    required fullWidth label="Ingresa tu Usuario" variant="filled"
                    value={username} onChange={(e) => setUsername(e.target.value)}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FontAwesomeIcon icon={faUser} />
                        </InputAdornment>
                      )
                    }}
                  />
                  <Button
                    type="submit" fullWidth variant="contained" color="secondary" size="large"
                    disabled={loading || !username.trim()}
                    sx={{ py: 1.5, fontWeight: 'bold' }}
                  >
                    {loading ? "Enviando..." : "Solicitar nueva clave"}
                  </Button>
                </>
              ) : (
                <Alert variant="filled" severity="success" sx={{ width: '100%' }}>
                  Enlace enviado al email de <strong>{username}</strong>.
                </Alert>
              )}

              <Button
                variant="text" fullWidth onClick={() => navigate('/login')}
                startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
                sx={{ mt: 3, color: 'rgba(255,255,255,0.7)', textTransform: 'none' }}
              >
                Volver al inicio
              </Button>
            </form>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackData.open}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: { xs: 8, sm: 10 } }}
      >
        <Alert onClose={handleSnackClose} severity={snackData.type} variant="filled" sx={{ width: '100%', maxWidth: { xs: '92vw', sm: 520 } }}>
          {snackData.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ForgotPassword;
