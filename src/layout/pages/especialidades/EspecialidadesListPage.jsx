import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import Typography from "@mui/material/Typography";
import {
    useTheme,
    LinearProgress,
    Tooltip,
    Alert,
    Snackbar
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import ConfirmDialog from "../../elements/ConfirmDialog";
import {
    borrarEspecialidad,
    listarEspecialidades,
    listarEspecialidadesCubiertas
} from "../../../services/especialidades.service";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import {useNavigate} from "react-router-dom";

const EspecialidadesListPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [idEspecialidad, setIdEspecialidad] = useState(0);
    const [modal, setModal] = useState({
        open: false,
        title: '',
        message: ''
    });

    const dataSnack = {
        type: 'info',
        message: '',
        open: false
    };
    const [snackData, setSnackData] = useState(dataSnack);

    //-------------------------------------------------------------------------- 
    const loadData = () => {
        setLoading(true);

        listarEspecialidades().then((r) => {
            setData(r);
            setLoading(false);
        });
    };
    //-------------------------------------------------------------------------- 
    useEffect(() => {
        loadData();
    }, []);
    //-------------------------------------------------------------------------- 
    const deleteEspecialidad = (id) => {
        listarEspecialidadesCubiertas().then((especialidadesCubiertas) => {
            const especialidadEnUso = especialidadesCubiertas.find((e) => e.id === id);
            if (especialidadEnUso) {
                setSnackData({
                    type: 'error',
                    message: 'Existen médicos con esa especialidad. No se puede borrar.',
                    open: true
                });
            } else {
                borrarEspecialidad(id).then((r) => {
                    if (r.status === 200) {
                        setSnackData({
                            type: 'success',
                            message: 'Datos borrados correctamente.',
                            open: true
                        });
                        loadData();
                    } else {
                        const errorText = r.statusText ?? 'Hubo un error al borrar. Vuelva a intentarlo.';
                        setSnackData({
                            type: 'error',
                            message: errorText,
                            open: true
                        });
                    }
                });
            }
        });
    };
    //-------------------------------------------------------------------------- 
    const openDeleteConfirmModal = (row) => {
        setIdEspecialidad(row.original.id);
        setModal({
            open: true,
            title: 'Eliminación',
            message: `¿Confirma la eliminación de la especialidad: ${row.original.nombre}?`
        });
    };
    //-------------------------------------------------------------------------- 
    const handleSnackClose = () => {
        setSnackData(dataSnack);
    };
    //-------------------------------------------------------------------------- 
    const columns = useMemo(
        () => [
            {
                accessorKey: 'nombre',
                header: 'Nombre',
                size: 520,
            },
        ],
        [],
    );

    //-------------------------------------------------------------------------- 
    const table = useMaterialReactTable({
        columns,
        data,
        enableHiding: false,
        localization: MRT_Localization_ES,
        muiTablePaperProps: {
            elevation: 0,
            sx: { backgroundColor: 'transparent' },
        },
        mrtTheme: (theme) => ({
            baseBackgroundColor: theme.palette.base.background,
        }),
        muiTableBodyProps: {
            sx: {
                '& tr:nth-of-type(odd) > td': {
                    backgroundColor: theme.palette.action.hover,
                },
            },
        },
        initialState: {
            pagination: { pageSize: 25 },
            sorting: [{ id: 'nombre', desc: false }],
        },
        getRowId: (row) => row.id,
        positionToolbarAlertBanner: 'bottom',
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: 'flex', gap: '1rem', p: '4px' }}>
                <Button
                    color="primary"
                    variant="contained"
                    onClick={() => navigate("/especialidades/form")}
                    startIcon={<FontAwesomeIcon icon={faCirclePlus} />}
                >
                    Añadir
                </Button>
            </Box>
        ),
        enableRowActions: true,
        positionActionsColumn: 'last',
        renderRowActions: ({ row }) => (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
                <Tooltip title="Editar">
                    <FontAwesomeIcon icon={faPen} color={theme.palette.grey["700"]} size="lg" className="action-icon" onClick={() => navigate("/especialidades/form/" + row.original.id )} />
                </Tooltip>
                <Tooltip title="Borrar">
                    <FontAwesomeIcon icon={faTrash} color={theme.palette.error.main} size="lg" className="action-icon" onClick={() => openDeleteConfirmModal(row)} />
                </Tooltip>
            </Box>
        ),
    });
    //-------------------------------------------------------------------------- 
    if (!data) return null;

    //============================================================================== 
    return (
        <>
            <Typography variant="h1" className="page-title" color="primary">
                Lista de Especialidades
            </Typography>
            {loading ? <Box sx={{ width: '100%' }}><LinearProgress /></Box> : ""}
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                    <MaterialReactTable table={table} />
            </Box>

            <ConfirmDialog
                title={modal.title}
                message={modal.message}
                severity='error'
                openDialog={modal.open}
                handleOKButton={() => deleteEspecialidad(idEspecialidad)}
                handleCloseDialog={() => setModal(false)}
            />

            <Snackbar
                open={snackData.open}
                autoHideDuration={4000}
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

export default EspecialidadesListPage;
