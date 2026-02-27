import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Box, Button, Tooltip, useTheme, LinearProgress, Alert, Snackbar } from "@mui/material";
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faPen, faTrash, faClipboardList } from '@fortawesome/free-solid-svg-icons';

import ConfirmDialog from "../../elements/ConfirmDialog";
import { borrarPaciente, listarPacientes } from "../../../services/pacientes.service";
import { listarTurnosDePaciente } from "../../../services/turnos.service";

const PacientesListPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    // Estados
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [idPaciente, setIdPaciente] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '' });
    const [snack, setSnack] = useState({ open: false, message: '', type: 'info' });

    // Carga de datos
    const loadData = async () => {
        setLoading(true);
        try {
            const r = await listarPacientes();
            setData(r);
        } catch (error) {
            setSnack({ open: true, message: 'Error al conectar con el servidor', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Manejo de eliminación
    const handleDeleteClick = (row) => {
        setIdPaciente(row.original.id);
        setModalConfig({
            title: 'Confirmar Eliminación',
            message: `¿Está seguro que desea eliminar al paciente ${row.original.apellido}, ${row.original.nombre}? Esta acción no se puede deshacer.`
        });
        setOpenDialog(true);
    };

    const confirmDelete = async () => {
        setOpenDialog(false);
        setLoading(true); // Mostramos progreso mientras validamos
        
        try {
            // 1. Verificar si tiene turnos
            // Interpretamos el 404 como "No tiene turnos" en el bloque catch
            const turnos = await listarTurnosDePaciente(idPaciente);

            // Si llega aquí y hay datos en el array
            if (turnos && turnos.length > 0) {
                setSnack({ 
                    open: true, 
                    message: 'El paciente tiene turnos asignados. No es posible eliminarlo.', 
                    type: 'error' 
                });
                setLoading(false);
                return;
            }

            // Si el array está vacío, procedemos a borrar
            await ejecutarBorrado();

        } catch (error) {
            // 2. Manejo del 404: Si la API responde 404, significa que NO tiene turnos registrados
            if (error.response && error.response.status === 404) {
                await ejecutarBorrado();
            } else {
                setSnack({ 
                    open: true, 
                    message: 'Error al verificar integridad de datos.', 
                    type: 'error' 
                });
                setLoading(false);
            }
        }
    };

    // Función auxiliar para no repetir código de borrado
    const ejecutarBorrado = async () => {
        try {
            const res = await borrarPaciente(idPaciente);
            if (res.status === 200 || res.status === 204) {
                setSnack({ 
                    open: true, 
                    message: 'Paciente eliminado. Actualizando lista...', 
                    type: 'success' 
                });
                await loadData();
            } else {
                setSnack({ open: true, message: 'El servidor rechazó la eliminación.', type: 'error' });
                setLoading(false);
            }
        } catch (err) {
            setSnack({ open: true, message: 'Error al intentar eliminar el registro.', type: 'error' });
            setLoading(false);
        }
    };

    // Columnas
    const columns = useMemo(() => [
        { accessorKey: 'apellido', header: 'Apellido', size: 120 },
        { accessorKey: 'nombre', header: 'Nombre', size: 120 },
        { accessorKey: 'telefono', header: 'Teléfono', size: 100 },
        { accessorKey: 'email', header: 'Email', size: 150 },
    ], []);

    // Configuración de la Tabla
    const table = useMaterialReactTable({
        columns,
        data,
        localization: MRT_Localization_ES,
        initialState: {
            pagination: { pageSize: 10 },
            sorting: [{ id: 'apellido', desc: false }],
            density: 'compact'
        },
        enableRowActions: true,
        positionActionsColumn: 'last',
        displayColumnDefOptions: {
            'mrt-row-actions': {
                header: 'Acciones',
                size: 150,
            },
        },
        renderTopToolbarCustomActions: () => (
            <Button
                color="primary"
                variant="contained"
                onClick={() => navigate("/pacientes/form")}
                startIcon={<FontAwesomeIcon icon={faCirclePlus} />}
            >
                Nuevo Paciente
            </Button>
        ),
        renderRowActions: ({ row }) => (
            <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Tooltip title="Ver Turnos">
                    <FontAwesomeIcon
                        icon={faClipboardList}
                        color={theme.palette.secondary.main}
                        size="lg"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate("/pacientes/turnos/" + row.original.id)}
                    />
                </Tooltip>
                <Tooltip title="Editar">
                    <FontAwesomeIcon
                        icon={faPen}
                        color={theme.palette.grey["700"]}
                        size="lg"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate("/pacientes/form/" + row.original.id)}
                    />
                </Tooltip>
                <Tooltip title="Eliminar">
                    <FontAwesomeIcon
                        icon={faTrash}
                        color={theme.palette.error.main}
                        size="lg"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleDeleteClick(row)}
                    />
                </Tooltip>
            </Box>
        ),
    });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h1" className="page-title" color="primary" sx={{ mb: 3 }}>
                Cartilla de Pacientes
            </Typography>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            <MaterialReactTable table={table} />

            <ConfirmDialog
                openDialog={openDialog}
                title={modalConfig.title}
                message={modalConfig.message}
                severity="error" // Esto activa los botones Si/No y el color rojo
                handleOKButton={confirmDelete}
                handleCloseDialog={() => setOpenDialog(false)}
            />

            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack({ ...snack, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snack.type} variant="filled" sx={{ width: '100%' }}>
                    {snack.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PacientesListPage;