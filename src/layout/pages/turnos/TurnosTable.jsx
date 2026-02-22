import React, {useState, useMemo, useEffect} from "react";
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import {useTheme, Alert, Snackbar, MenuItem, Box, Button, Tooltip} from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import ConfirmDialog from "../../elements/ConfirmDialog";
import { borrarTurno, modificarEstadoTurno } from "../../../services/turnos.service";
import {ActionButtons} from "./ActionButtons";
import dayjs from "dayjs";
import {listarEstados} from "../../../services/estados.service";
import {useNavigate} from "react-router-dom";
import {DATE_FORMAT} from "../../libs/constants";

export const TurnosTable = ({ fecha, data, loadData, setEstadosCargados }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [idTurno, setIdTurno] = useState(0);
    const [modal, setModal] = useState({ open: false, title: '', message: '' });
    const [snackData, setSnackData] = useState({ type: 'info', message: '', open: false });
    //--------------------------------------------------------------------------
    let estadosLocal = [];
    const loadStatus = () => {
        listarEstados().then((r) => {
            estadosLocal = r;
            setEstadosCargados(true);
        });
    };
    useEffect(() => {
        loadStatus();
    }, []);
    //--------------------------------------------------------------------------
    const deleteTurno = (id) => {
        borrarTurno(id).then( (r) => {
            if (r !== '0'){
                setSnackData({
                    type: 'success',
                    message: 'Datos borrados correctamente.',
                    open: true
                })
                // Para que luego de eliminar se quede en la misma fecha:
                loadData(dayjs(fecha).format(DATE_FORMAT));
            }
            else{
                setSnackData({
                    type: 'error',
                    message: 'Hubo un error al borrar. Vuelva a intentarlo.',
                    open: true
                })
            }
        });
    };
    //--------------------------------------------------------------------------
    const openDeleteConfirmModal = (row) => {
        setIdTurno(row.original.id);
        setModal({
            open: true,
            title: 'Eliminación',
            message: `¿Confirma la eliminación del turno de ${row.original.paciente} con ${row.original.medico}?`
        });
    };
    //--------------------------------------------------------------------------
    const dataSnack = {
        type: 'info',
        message: '',
        open: false
    }
    //--------------------------------------------------------------------------
    const handleSnackClose = () => {
        setSnackData(dataSnack);
    };
    //--------------------------------------------------------------------------
    const handleStatusChange = (id, newStatus) => {
        modificarEstadoTurno(id, newStatus).then( (r) => {
            if (r.status === 200) {
                setSnackData({
                    duration: 6000,
                    type: 'success',
                    message: 'Actualizado correctamente.',
                    open: true,
                    action: ''
                });
                document.getElementById('turnos-title').focus();
            }
            else{
                const errorText = r.statusText??'Hubo un error al actualizar. Vuelva a intentarlo.';

                setSnackData({
                    type: 'error',
                    message: errorText,
                    open: true
                })
            }
        });
    }
    //--------------------------------------------------------------------------
    const columns = useMemo(
        () => [
            {
                accessorKey: 'id', // Oculta en la configuración de la Tabla
            },
            {
                accessorKey: 'fecha', // Oculta en la configuración de la Tabla
            },
            {
                accessorKey: 'hora',
                header: 'Hora',
                size: 50,
                enableEditing: false,
            },
            {
                accessorKey: 'paciente',
                header: 'Paciente',
                size: 200,
                enableEditing: false,
            },
            {
                accessorKey: 'medico',
                header: 'Médico',
                size: 200,
                enableEditing: false,
            },
            {
                accessorKey: 'estado',
                Cell: ({ cell, row }) => {
                    return <div className={row.original.estadoClase}><FontAwesomeIcon icon={row.original.estadoIcono} size="lg" />&nbsp;{cell.getValue()}</div>;
                },
                grow: false,
                header: 'Estado',
                editVariant: 'select',
                muiEditTextFieldProps: ({ cell, row }) => ({
                    select: true,
                    sx: {width: '150px' },
                    children: estadosLocal.map(st => {
                        return (
                            <MenuItem
                                key={st.id}
                                value={st.nombre}
                                data-id={st.id}
                                data-clase={st.clase}
                                data-icono={st.icono}
                                className={st.clase}
                            >
                                <FontAwesomeIcon icon={st.icono} size="lg" />
                                &nbsp;{st.nombre}
                            </MenuItem>
                        )
                    }),
                    onClick: (event) => {
                        if (event.target.dataset != undefined) {
                            // Cuando se activa la lista, pero se hace clic
                            // AFUERA (para cerrarla sin modificar), el dataset
                            // devuelve un "DOMStringMap" vacío, por eso es
                            // necesario verificar que el ID está definido.
                            if (event.target.dataset.id != undefined) {
                                row.original.estadoClase = event.target.dataset.clase;
                                row.original.estadoIcono = event.target.dataset.icono;

                                handleStatusChange(row.original.id, event.target.dataset.id);
                            }
                        }
                    },
                    //error: !!validationErrors?.state,
                    //helperText: validationErrors?.state,

                }),
            },
            {
                accessorKey: 'observaciones',
                header: 'Obs',
                size: 100,
                enableEditing: false,
            },
        ],
        [],
    );
    //--------------------------------------------------------------------------
    const table = useMaterialReactTable({
        columns,
        data,
        enableHiding: false,
        editDisplayMode: 'cell',
        enableEditing: true,
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
            columnVisibility: { id: false, fecha: false },
            sorting: [
                {id: 'paciente', desc: false},
                {id: 'medico', desc: false},
            ]
        },
        getRowId: (row) => row.id,
        positionToolbarAlertBanner: 'bottom',
        renderTopToolbarCustomActions: ({ table }) => (
            <ActionButtons fecha={fecha} />
        ),
        enableRowActions: true,
        positionActionsColumn: 'last',
        renderRowActions: ({ row, table }) => (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
                <Tooltip title="Editar">
                    <FontAwesomeIcon icon={faPen} color={theme.palette.grey["700"]} size="lg" className="action-icon" onClick={() => navigate("/turnos/form/" + row.original.id)} />
                </Tooltip>
                <Tooltip title="Borrar">
                    <FontAwesomeIcon icon={faTrash} color={theme.palette.error.main} size="lg" className="action-icon" onClick={() => openDeleteConfirmModal(row)} />
                </Tooltip>
            </Box>
        ),
    });

    //**************************************************************************
    //**************************************************************************
    //**************************************************************************
    return (
        <>
            <MaterialReactTable table={table} />
            <Alert severity="info">Para cambiar el estado, haga doble clic en la celda del valor a cambiar.</Alert>
            <ConfirmDialog
                title={modal.title}
                message={modal.message}
                severity='error'
                openDialog={modal.open}
                handleOKButton={() => deleteTurno(idTurno)}
                handleCloseDialog={() => setModal(false)}
            />
            <Snackbar
                open={snackData.open}
                autoHideDuration={4000}
                onClose={handleSnackClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
            >
                <Alert onClose={handleSnackClose} severity={snackData.type} variant="filled" sx={{ width: '100%' }}>
                    {snackData.message}
                </Alert>
            </Snackbar>
        </>
    );
};