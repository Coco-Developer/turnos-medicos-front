import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useTheme} from "@mui/material";
import Box from "@mui/material/Box";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCircleXmark, faCircleCheck, faCircleInfo, faCircleExclamation, faTriangleExclamation, faBell} from '@fortawesome/free-solid-svg-icons'

// Algo del código basado en
// https://codesandbox.io/p/sandbox/ecstatic-shamir-1ffso?file=%2Fsrc%2FChild.js%3A43%2C9-44%2C30

const ConfirmDialog = (
    {
        name= 'Guest',
        title= 'Diálogo',
        message= '',
        severity = 'info',
        types = ['info', 'success', 'warning', 'error'],
        openDialog= false,
        handleOKButton,
        handleCloseDialog,
        contentRTF = false
    }) => {
    const theme = useTheme();

    let backColor,
        icon,
        btnColor = severity;

    switch (severity){
        case 'info':
            backColor = theme.palette.primary.main;
            icon = <FontAwesomeIcon icon={faCircleInfo} size="lg" />;
            btnColor = 'primary';
            break;
        case 'success':
            backColor = theme.palette.success.main;
            icon = <FontAwesomeIcon icon={faCircleCheck} size="lg" />;
            break;
        case 'warning':
            backColor = theme.palette.warning.light;
            icon = <FontAwesomeIcon icon={faTriangleExclamation} size="lg" />;
            break;
        case 'error':
            backColor = theme.palette.error.main;
            icon = <FontAwesomeIcon icon={faCircleExclamation} size="lg" />;
            break;
        default:
            backColor = '#6010b0';
            btnColor = 'primary';
            icon = <FontAwesomeIcon icon={faBell} size="lg" />;
    }

    const handleClose = () => {
        handleCloseDialog();
    };

    const handleOK = () =>{
        handleOKButton();
        handleClose();
    };

    return (
        <>
            <Dialog
                open={openDialog}
                onClose={handleClose}
            >
                <DialogTitle
                    id="alert-dialog-title"
                    style={{ backgroundColor: backColor, color: '#fff', display: "flex", justifyContent: "left" }}
                >
                    {icon}
                    <Box sx={{ ml: 1 }} >
                        {title}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {contentRTF ? message: (
                        <DialogContentText id="alert-dialog-description">
                            {message}
                        </DialogContentText>
                    )}
                </DialogContent>
                <DialogActions>

                    <Button
                        color={btnColor}
                        onClick={handleClose}
                        startIcon={<FontAwesomeIcon icon={faCircleXmark} />}
                    >
                        {severity === 'info' ? 'Cerrar' : 'No'}
                    </Button>
                    {(severity !== 'info') && (
                        <Button
                            color={btnColor}
                            variant="contained"
                            startIcon={<FontAwesomeIcon icon={faCircleCheck} />}
                            onClick={handleOK}
                            autoFocus
                        >
                            Si
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

/*
Esto (defaultProps) será transformado en obsoleto próximamente por el equipo de
React. por eso está comentado
ConfirmDialog.defaultProps = {
    name: "Guest",
    title: 'Diálogo',
    message: 'Hola Mundo!',
    severity: '',
    isDialogOpened: false,
    handleOKButton: {},
    handleCloseDialog: {}
};
 */


export default ConfirmDialog;