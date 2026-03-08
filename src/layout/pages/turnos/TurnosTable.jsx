import React, { useState, useMemo, useEffect } from "react";
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { useTheme, Alert, Snackbar, MenuItem, Box, Tooltip } from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import ConfirmDialog from "../../elements/ConfirmDialog";
import { borrarTurno, modificarEstadoTurno } from "../../../services/turnos.service";
import { ActionButtons } from "./ActionButtons";
import dayjs from "dayjs";
import { listarEstados } from "../../../services/estados.service";
import { useNavigate } from "react-router-dom";
import { DATE_FORMAT } from "../../libs/constants";

export const TurnosTable = ({ fecha, data, loadData, setEstadosCargados }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [idTurno, setIdTurno] = useState(0);
    const [modal, setModal] = useState({ open: false, title: '', message: '' });
    const [snackData, setSnackData] = useState({ severity: 'info', message: '', open: false });
    const [estadosLocal, setEstadosLocal] = useState([]);

    const loadStatus = () => {
        listarEstados().then((r) => {
            setEstadosLocal(r);
            if (typeof setEstadosCargados === 'function') {
                setEstadosCargados(true);
            }
        }).catch(err => console.error("Error al cargar estados", err));
    };

    useEffect(() => {
        loadStatus();
    }, []);

    // FUNCIÓN BORRAR ACTUALIZADA
    const deleteTurno = async (id) => {
        try {
            const r = await borrarTurno(id);
            // Asumimos que si no hay error en el catch, fue exitoso
            setSnackData({
                severity: 'success',
                message: r?.data?.message || 'Datos borrados correctamente.',
                open: true
            });
            
            // Actualización de la tabla
            if (typeof loadData === 'function') {
                loadData(dayjs(fecha).format(DATE_FORMAT));
            }
        } catch (error) {
            setSnackData({
                severity: 'error',
                message: error?.response?.data?.message || 'Hubo un error al borrar. Vuelva a intentarlo.',
                open: true
            });
        }
    };

    // FUNCIÓN CAMBIO DE ESTADO ACTUALIZADA
    const handleStatusChange = async (id, newStatusId) => {
        try {
            const r = await modificarEstadoTurno(id, newStatusId);
            if (r.status === 200 || r.status === 201) {
                setSnackData({
                    severity: 'success',
                    message: r?.data?.message || 'Actualizado correctamente.',
                    open: true,
                });
                
                if (typeof loadData === 'function') {
                    loadData(dayjs(fecha).format(DATE_FORMAT));
                }
            }
        } catch (error) {
            setSnackData({
                severity: 'error',
                message: error?.response?.data?.message || 'Hubo un error al actualizar.',
                open: true
            });
        }
    };

    const openDeleteConfirmModal = (row) => {
        setIdTurno(row.original.id);
        setModal({
            open: true,
            title: 'Eliminación',
            message: `¿Confirma la eliminación del turno de ${row.original.paciente} con ${row.original.medico}?`
        });
    };

    const handleSnackClose = () => {
        setSnackData((prev) => ({ ...prev, open: false }));
    };

    const columns = useMemo(
        () => [
            { accessorKey: 'id' },
            { accessorKey: 'fecha' },
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
                header: 'Estado',
                grow: false,
                editVariant: 'select',
                Cell: ({ cell, row }) => (
                    <Box
                        className={row.original.estadoClase}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            cursor: "pointer"
                        }}
                    >
                        <FontAwesomeIcon icon={row.original.estadoIcono} size="lg" />
                        {cell.getValue()}
                    </Box>
                ),
                muiEditTextFieldProps: ({ row }) => ({
                    select: true,
                    sx: { width: "160px" },
                    onChange: (event) => {
                        const selectedValue = event.target.value;
                        const estadoEncontrado = estadosLocal.find(st => st.nombre === selectedValue);
                        if (estadoEncontrado) {
                            handleStatusChange(row.original.id, estadoEncontrado.id);
                        }
                    },
                    children: estadosLocal.map((st) => (
                        <MenuItem
                            key={st.id}
                            value={st.nombre}
                            className={st.clase}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FontAwesomeIcon icon={st.icono} size="lg" />
                                {st.nombre}
                            </Box>
                        </MenuItem>
                    )),
                }),
            },
            {
                accessorKey: 'observaciones',
                header: 'Obs',
                size: 100,
                enableEditing: false,
            },
        ],
        [estadosLocal]
    );

    const table = useMaterialReactTable({
        columns,
        data,
        enableHiding: false,
        enableStickyHeader: true,
        editDisplayMode: 'cell',
        enableEditing: true,
        localization: MRT_Localization_ES,
        muiTablePaperProps: {
            elevation: 0,
            sx: { backgroundColor: 'transparent', width: "100%", overflow: "hidden" },
        },
        muiTableContainerProps: {
            sx: {
                width: "100%",
                maxWidth: "100%",
                overflowX: "auto",
                maxHeight: { xs: "60dvh", md: "68dvh" }
            }
        },
        mrtTheme: (theme) => ({
            baseBackgroundColor: theme.palette.background.default,
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
            columnVisibility: { id: false, fecha: false },
            sorting: [
                { id: 'paciente', desc: false },
                { id: 'medico', desc: false },
            ]
        },
        getRowId: (row) => row.id,
        positionToolbarAlertBanner: 'bottom',
        renderTopToolbarCustomActions: () => (
            <ActionButtons fecha={fecha} />
        ),
        enableRowActions: true,
        positionActionsColumn: 'last',
        renderRowActions: ({ row }) => (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
                <Tooltip title="Editar">
                    <Box component="span" sx={{ cursor: 'pointer' }}>
                        <FontAwesomeIcon 
                            icon={faPen} 
                            color={theme.palette.grey["700"]} 
                            size="lg" 
                            onClick={() => navigate("/turnos/form/" + row.original.id)} 
                        />
                    </Box>
                </Tooltip>
                <Tooltip title="Borrar">
                    <Box component="span" sx={{ cursor: 'pointer' }}>
                        <FontAwesomeIcon 
                            icon={faTrash} 
                            color={theme.palette.error.main} 
                            size="lg" 
                            onClick={() => openDeleteConfirmModal(row)} 
                        />
                    </Box>
                </Tooltip>
            </Box>
        ),
    });

    return (
        <>
            <MaterialReactTable table={table} />
            <Alert severity="info" sx={{ mt: 1 }}>Para cambiar el estado, haga clic en la celda del valor a cambiar.</Alert>
            
            <ConfirmDialog
                title={modal.title}
                message={modal.message}
                severity='error'
                openDialog={modal.open}
                handleOKButton={() => {
                    deleteTurno(idTurno);
                    setModal({ ...modal, open: false });
                }}
                handleCloseDialog={() => setModal({ ...modal, open: false })}
            />

            <Snackbar
                open={snackData.open}
                autoHideDuration={4000}
                onClose={handleSnackClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ mt: { xs: 8, sm: 10 } }}
            >
                <Alert onClose={handleSnackClose} severity={snackData.severity} variant="filled" sx={{ width: '100%', maxWidth: { xs: '92vw', sm: 520 } }}>
                    {snackData.message}
                </Alert>
            </Snackbar>
        </>
    );
};
