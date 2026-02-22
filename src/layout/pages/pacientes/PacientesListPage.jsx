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
import { MaterialReactTable, useMaterialReactTable, } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import ConfirmDialog from "../../elements/ConfirmDialog";
import { borrarPaciente, listarPacientes } from "../../../services/pacientes.service";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlus, faPen, faTrash, faClipboardList } from '@fortawesome/free-solid-svg-icons'
import { listarTurnosDePaciente } from "../../../services/turnos.service";
import {useNavigate} from "react-router-dom";

const PacientesListPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [idPaciente, setIdPaciente] = useState(0);
    const [modal, setModal] = useState({
        open: false,
        title: '',
        message: ''
    });

    const dataSnack = {
        type: 'info',
        message: '',
        open: false
    }
    const [snackData, setSnackData] = useState(dataSnack)

    //--------------------------------------------------------------------------
    const loadData = () => {
        setLoading(true);

        listarPacientes().then( (r) => {
            setData(r);
            setLoading(false);
            //console.log(r);
        });
    }
    //--------------------------------------------------------------------------
    useEffect(() => {
        loadData();
    }, []);
    //--------------------------------------------------------------------------
    const deletePaciente = (id) => {
        listarTurnosDePaciente(id).then( (r) => {
            if (r.length === 0) {
                borrarPaciente(id).then((r) => {
                    if (r.status === 200) {
                        setSnackData({
                            type: 'success',
                            message: 'Datos borrados correctamente.',
                            open: true
                        })
                        loadData();
                    } else {
                    }
                });
            }
            else {
                const errorText = r.statusText ?? 'El paciente tiene turnos asignados. No se puede borrar.';
                setSnackData({
                    type: 'error',
                    message: errorText,
                    open: true
                })
            }
        })


    };
    //--------------------------------------------------------------------------
    const openDeleteConfirmModal = (row) => {
        setIdPaciente(row.original.id);
        setModal({
            open: true,
            title: 'Eliminación',
            message: `¿Confirma la eliminación del paciente: ${row.original.nombre} ${row.original.apellido}?`
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
                accessorKey: 'apellido',
                header: 'Apellido',
                size: 100,

            },
            {
                accessorKey: 'nombre',
                header: 'Nombre',
                size: 100,

            },
            {
                accessorKey: 'telefono',
                header: 'Teléfono',
                size: 50,
            },
            {
                accessorKey: 'email',
                header: 'Email',
                size: 100,
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
        muiTablePaperProps:{
            elevation: 0,
            sx: {backgroundColor: 'transparent'},
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
            pagination: { pageSize: 25},
            sorting: [
                {id: 'apellido', desc: false},
                {id: 'nombre', desc: false},
            ]
        },
        getRowId: (row) => row.id,
        positionToolbarAlertBanner: 'bottom',
        renderTopToolbarCustomActions: ({ table }) => (
            <Box sx={{ display: 'flex', gap: '1rem', p: '4px' }}>
                <Button
                    color="primary"
                    variant="contained"
                    onClick={() => navigate("/pacientes/form")}
                    startIcon={<FontAwesomeIcon icon={faCirclePlus} />}
                >
                    Añadir
                </Button>
            </Box>
        ),
        enableRowActions: true,
        positionActionsColumn: 'last',
        renderRowActions: ({ row, table }) => (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
                <Tooltip title="Turnos">
                    <FontAwesomeIcon icon={faClipboardList} color={theme.palette.secondary.main} size="lg" className="action-icon" onClick={() => navigate("/pacientes/turnos/" + row.original.id)} />
                </Tooltip>
                <Tooltip title="Editar">
                    <FontAwesomeIcon icon={faPen} color={theme.palette.grey["700"]} size="lg" className="action-icon" onClick={() => navigate("/pacientes/form/" + row.original.id)} />
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
                Lista de Pacientes
            </Typography>
            {loading? <Box sx={{ width: '100%' }}><LinearProgress /></Box>:""}

            <MaterialReactTable table={table}  />

            <ConfirmDialog
                title={modal.title}
                message={modal.message}
                severity='error'
                openDialog={modal.open}
                handleOKButton={() => deletePaciente(idPaciente)}
                handleCloseDialog={() => setModal(false)}
            />

            <Snackbar
                open={snackData.open}
                autoHideDuration={4000}
                onClose={handleSnackClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
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

export default PacientesListPage;