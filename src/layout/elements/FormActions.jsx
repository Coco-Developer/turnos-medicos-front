import React, {useEffect, useState} from "react";
import { Button, Snackbar, Alert } from "@mui/material";
import Grid from '@mui/material/Grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useSnack } from '../context/SnackContext';
import { useNavigate } from 'react-router-dom';

export const FormActions = ({ onSubmit,  loading}) => {
    const { snackData, setSnackData } = useSnack();
    const navigate = useNavigate(); // Hook para la navegación

    // 20250329: Hay 2 opciones: volver automáticamente a la lista luego de x
    // segundos (luego de Alta o Modificación), o manualmente mediante un botón.
    // Creo que la mejor opción es la automática, pero por las dudas, queda esto
    // comentado.
    // Si se llega a utilizar el botón nuevamente, añadir:
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

    // Efecto para cerrar el snackbar y navegar después de 2 segundos
    useEffect(() => {
        // Si el snackbar está abierto Y la acción es 'alta', redirige a href
        if (snackData.open && (snackData.action === 'alta' || snackData.action === 'mod')) {
            const timeout = setTimeout(() => {
                setSnackData((prev) => ({ ...prev, open: false }));
                    navigate(snackData.href);
            }, 2000);

            return () => clearTimeout(timeout); // Limpia el timeout si el componente se desmonta
        }
    }, [snackData.open]); // Se ejecuta cada vez que snackData.open cambia

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
                    onClick={onSubmit}
                >
                    Guardar
                </Button>
            </Grid>
            <Snackbar
                open={snackData.open}
                autoHideDuration={snackData.duration}
                onClose={handleSnackClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackClose}
                    severity={snackData.type}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackData.message}

                </Alert>
            </Snackbar>
        </>
    );
};