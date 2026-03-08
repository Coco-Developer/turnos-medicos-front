import { useMemo, useState } from "react";
import { cambiarPassword } from "../../../services/auth.service";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faKey, faLock, faShieldAlt } from "@fortawesome/free-solid-svg-icons";
import { useSnack } from "../../context/SnackContext";

const CambiarPasswordPage = () => {
    const { setSnackData } = useSnack();
    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [showPass, setShowPass] = useState(false);

    const passwordRulesOk = useMemo(() => newPassword.trim().length >= 8, [newPassword]);
    const hasUpper = useMemo(() => /[A-Z]/.test(newPassword), [newPassword]);
    const hasNumber = useMemo(() => /[0-9]/.test(newPassword), [newPassword]);
    const hasSymbol = useMemo(() => /[^a-zA-Z0-9]/.test(newPassword), [newPassword]);
    const isMatch = useMemo(() => newPassword.length > 0 && newPassword === repeatPassword, [newPassword, repeatPassword]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!passwordRulesOk) {
            setSnackData({ type: "error", message: "La nueva clave debe tener al menos 8 caracteres.", open: true });
            return;
        }

        if (newPassword !== repeatPassword) {
            setSnackData({ type: "error", message: "Las claves no coinciden.", open: true });
            return;
        }

        setLoading(true);
        try {
            await cambiarPassword(currentPassword, newPassword);
            setSnackData({ type: "success", message: "Clave actualizada correctamente.", open: true });
            setCurrentPassword("");
            setNewPassword("");
            setRepeatPassword("");
        } catch (error) {
            setSnackData({
                type: "error",
                message: error?.response?.data?.message || "No se pudo actualizar la clave.",
                open: true
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ width: "100%", maxWidth: 980, mx: "auto", py: { xs: 1, md: 2 } }}>
            <Paper elevation={4} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 3 }}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={3}
                    divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />}
                >
                    <Box sx={{ flex: 1.2 }}>
                        <Stack spacing={1.2} sx={{ mb: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                Cambiar Contrasena
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Actualiza tus credenciales y protege tu cuenta.
                            </Typography>
                        </Stack>

                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Clave actual"
                                    type={showPass ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    autoComplete="current-password"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FontAwesomeIcon icon={faLock} />
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    required
                                    label="Nueva clave"
                                    type={showPass ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    autoComplete="new-password"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FontAwesomeIcon icon={faKey} />
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    required
                                    label="Repetir nueva clave"
                                    type={showPass ? "text" : "password"}
                                    value={repeatPassword}
                                    onChange={(e) => setRepeatPassword(e.target.value)}
                                    autoComplete="new-password"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FontAwesomeIcon icon={faShieldAlt} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <FontAwesomeIcon
                                                    icon={showPass ? faEyeSlash : faEye}
                                                    onClick={() => setShowPass((prev) => !prev)}
                                                    style={{ cursor: "pointer" }}
                                                />
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                {!passwordRulesOk && newPassword.length > 0 && (
                                    <Alert severity="warning">La clave debe tener minimo 8 caracteres.</Alert>
                                )}

                                <Button
                                    fullWidth
                                    variant="contained"
                                    type="submit"
                                    disabled={loading}
                                    sx={{ py: 1.25, mt: 1 }}
                                >
                                    {loading ? <CircularProgress size={22} color="inherit" /> : "Guardar cambios"}
                                </Button>
                            </Stack>
                        </Box>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            Recomendaciones
                        </Typography>
                        <List dense sx={{ mb: 2 }}>
                            <ListItem><ListItemText primary={`${passwordRulesOk ? "OK" : "Pendiente"} Minimo 8 caracteres`} /></ListItem>
                            <ListItem><ListItemText primary={`${hasUpper ? "OK" : "Pendiente"} Al menos 1 mayuscula`} /></ListItem>
                            <ListItem><ListItemText primary={`${hasNumber ? "OK" : "Pendiente"} Al menos 1 numero`} /></ListItem>
                            <ListItem><ListItemText primary={`${hasSymbol ? "OK" : "Pendiente"} Al menos 1 simbolo`} /></ListItem>
                            <ListItem><ListItemText primary={`${isMatch ? "OK" : "Pendiente"} Confirmacion coincide`} /></ListItem>
                        </List>
                        <Alert severity="info">
                            Evita usar datos personales y no reutilices claves de otros servicios.
                        </Alert>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
};

export default CambiarPasswordPage;
