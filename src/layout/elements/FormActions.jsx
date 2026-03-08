import React, {useEffect, useState} from "react";
import { Button, Snackbar, Alert } from "@mui/material";
import Grid from '@mui/material/Grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useSnack } from '../context/SnackContext';
import { useNavigate } from 'react-router-dom';

export const FormActions = ({ onSubmit,  loading}) => {
    const { snackData, setSnackData } = useSnack();
    const navigate = useNavigate(); // Hook para la navegaciÃ³n

    // 20250329: Hay 2 opciones: volver automÃ¡ticamente a la lista luego de x
    // segundos (luego de Alta o ModificaciÃ³n), o manualmente mediante un botÃ³n.
    // Creo que la mejor opciÃ³n es la automÃ¡tica, pero por las dudas, queda esto
    // comentado.
    // Si se llega a utilizar el botÃ³n nuevamente, aÃ±adir:
    // {snackData.action === 'alta' && snackActionAlta}
    // antes del cierre del Alert.
    // const snackActionAlta = (
    //     <Button
    //         size="small"
    //         variant="outlined"
    //         color="secondary"
    //         sx={{ ml: 2 }}
    //         startIcon={<FontAwesomeIcon icon={faChevronLeft} />}
    //         onClick={() => { window.location.href = snackData.href }}
    //     >
    //         Volver a Lista
    //     </Button>
    // );

    const handleSnackClose = () => setSnackData({ ...snackData, open: false });

    // Efecto para cerrar el snackbar y navegar despuÃ©s de 2 segundos
    useEffect(() => {
    if (snackData.open && (snackData.action === 'alta' || snackData.action === 'mod')) {
        const timeout = setTimeout(() => {
            // PRIMERO: Cerramos el snack localmente
            setSnackData((prev) => ({ ...prev, open: false }));
            // SEGUNDO: Navegamos
            navigate(snackData.href);
        }, 2000);

        return () => clearTimeout(timeout);
    }
}, [snackData.open, navigate, snackData.action, snackData.href]);

    //**************************************************************************
    //**************************************************************************
    //**************************************************************************
    return (
        <>
            <Grid size={{ xs: 12, md: 12 }} textAlign={'center'}>
                <Button
                    variant="contained"
                    size="large"
                    color="primary"
                    type="submit"
                    loading={loading}
                    loadingPosition="start"
                    startIcon={<FontAwesomeIcon icon={faCloudArrowUp} />}
                    disabled={loading}
                >
                    Guardar
                </Button>
            </Grid>
            <Snackbar
                open={snackData.open}
                autoHideDuration={snackData.duration}
                onClose={handleSnackClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ mt: { xs: 8, sm: 10 } }}
            >
                <Alert
                    onClose={handleSnackClose}
                    severity={snackData.type}
                    variant="filled"
                    sx={{ width: '100%', maxWidth: { xs: '92vw', sm: 520 } }}
                >
                    {snackData.message}

                </Alert>
            </Snackbar>
        </>
    );
};

