import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    useTheme, LinearProgress, Tooltip, Alert, Snackbar, Paper, 
    TableContainer, Table, TableHead, TableBody, TableRow, TableCell,
    Typography, Box, Button
} from "@mui/material";
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faPen, faTrash, faClock } from '@fortawesome/free-solid-svg-icons';
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Componentes y Servicios
import ConfirmDialog from "../../elements/ConfirmDialog";
import { borrarMedico, listarMedicos, obtenerHorarioMedico } from "../../../services/medicos.service";
import { listarEspecialidades } from "../../../services/especialidades.service";
import { listarTurnosDeMedico } from "../../../services/turnos.service";

dayjs.extend(customParseFormat);

const MedicosListPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [idMedico, setIdMedico] = useState(null);

    const [modal, setModal] = useState({
        open: false, type: 'info', title: '', message: '', severity: 'info', contentRTF: false
    });

    const [snackData, setSnackData] = useState({ type: 'info', message: '', open: false });

    const days = [
        { key: "lun", label: "Lunes" }, { key: "mar", label: "Martes" },
        { key: "mie", label: "Miércoles" }, { key: "jue", label: "Jueves" },
        { key: "vie", label: "Viernes" }, { key: "sab", label: "Sábado" },
        { key: "dom", label: "Domingo" },
    ];

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [resMedicos, resEspecialidades] = await Promise.all([
                listarMedicos(),
                listarEspecialidades()
            ]);
            setData(resMedicos);
            setEspecialidades(resEspecialidades);
        } catch (error) {
            setSnackData({ type: 'error', message: 'Error al conectar con el servidor', open: true });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const procederBorrado = (id) => {
        borrarMedico(id).then(() => {
            setSnackData({ type: 'success', message: 'Médico eliminado. Actualizando lista...', open: true });
            loadData(); 
        }).catch(() => {
            setSnackData({ type: 'error', message: 'Error al intentar borrar el registro.', open: true });
        }).finally(() => setLoading(false));
    };

    const deleteMedico = (id) => {
        setLoading(true);
        listarTurnosDeMedico(id)
            .then((r) => {
                if (Array.isArray(r) && r.length > 0) {
                    setSnackData({ type: 'error', message: 'No se puede borrar: El médico tiene turnos asignados.', open: true });
                    setLoading(false);
                } else {
                    procederBorrado(id);
                }
            })
            .catch((err) => {
                if (err.response?.status === 404 || err.status === 404) {
                    procederBorrado(id);
                } else {
                    setSnackData({ type: 'error', message: 'Error al verificar turnos.', open: true });
                    setLoading(false);
                }
            });
    };

    const openInfoConfirmModal = (row) => {
        const id = row.original.id;
        obtenerHorarioMedico(id).then((r) => {
            const inicioRow = [];
            const finRow = [];
            days.forEach((_, index) => {
                const diaSemanaBuscado = index + 1;
                const horario = r ? r.find((h) => h.diaSemana === diaSemanaBuscado) : null;
                inicioRow.push(horario ? dayjs(horario.horarioAtencionInicio, 'HH:mm:ss').format('HH:mm') : "-");
                finRow.push(horario ? dayjs(horario.horarioAtencionFin, 'HH:mm:ss').format('HH:mm') : "-");
            });

            const thStyle = { height: '3rem', p: 1, color: '#fff', borderRight: '1px solid rgba(255,255,255,0.2)', fontSize: '0.8rem' };
            const horariosTable = (
                <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 0, border: '1px solid #eee' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                                <TableCell sx={thStyle}>Día</TableCell>
                                {days.map((d) => <TableCell key={d.key} align="center" sx={thStyle}>{d.label.substring(0, 3)}</TableCell>)}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '0.75rem' }}>Inicio</TableCell>
                                {inicioRow.map((col, idx) => <TableCell key={idx} align="center" sx={{ fontSize: '0.75rem' }}>{col}</TableCell>)}
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '0.75rem' }}>Fin</TableCell>
                                {finRow.map((col, idx) => <TableCell key={idx} align="center" sx={{ fontSize: '0.75rem' }}>{col}</TableCell>)}
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            );

            setModal({
                open: true, type: 'info', title: `Horario: ${row.original.apellido}`,
                message: horariosTable, severity: 'info', contentRTF: true,
            });
        });
    };

    // --- COLUMNAS OPTIMIZADAS (Anchos fijos para evitar expansión excesiva) ---
    const columns = useMemo(() => [
        {
            accessorKey: 'foto',
            header: '',
            size: 50, // Muy pequeña para la foto
            enableColumnFilter: false,
            Cell: ({ row }) => (
                <img alt="F" height={32} width={32}
                    src={row.original.foto ? `data:image/jpeg;base64,${row.original.foto}` : '/default-avatar.png'}
                    style={{ borderRadius: '50%', objectFit: 'cover', border: `1px solid ${theme.palette.divider}` }}
                />
            ),
        },
        { accessorKey: 'matricula', header: 'Matrícula', size: 100 },
        { accessorKey: 'apellido', header: 'Apellido', size: 150 },
        { accessorKey: 'nombre', header: 'Nombre', size: 150 },
        { accessorKey: 'telefono', header: 'Teléfono', size: 120 },
        { 
            header: 'Especialidad',
            id: 'especialidad_display',
            size: 180,
            accessorFn: (row) => {
                const idBuscado = row.especialidadid || row.especialidadId || row.especialidad;
                const esp = especialidades.find(e => e.id === idBuscado);
                return esp ? esp.nombre : "-";
            }
        },
    ], [especialidades, theme.palette.divider]);

    const table = useMaterialReactTable({
        columns,
        data,
        localization: MRT_Localization_ES,
        enableRowActions: true,
        positionActionsColumn: 'last',
        layoutMode: 'auto', // <--- ESTO hace que la tabla se ajuste al contenido
        initialState: {
            density: 'compact', // <--- Más pequeña desde el inicio
            pagination: { pageSize: 10 },
        },
        displayColumnDefOptions: {
            'mrt-row-actions': {
                header: 'Acciones',
                size: 120, // Controlamos el ancho de la columna de acciones
            },
        },
        renderTopToolbarCustomActions: () => (
            <Button
                color="primary" variant="contained" onClick={() => navigate("/medicos/form")}
                startIcon={<FontAwesomeIcon icon={faCirclePlus} />}
            >
                Añadir Médico
            </Button>
        ),
        renderRowActions: ({ row }) => (
            <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Tooltip title="Horario">
                    <FontAwesomeIcon icon={faClock} style={{ cursor: 'pointer', color: theme.palette.info.main }} onClick={() => openInfoConfirmModal(row)} />
                </Tooltip>
                <Tooltip title="Editar">
                    <FontAwesomeIcon icon={faPen} style={{ cursor: 'pointer', color: theme.palette.grey[700] }} onClick={() => navigate("/medicos/form/" + row.original.id)} />
                </Tooltip>
                <Tooltip title="Borrar">
                    <FontAwesomeIcon icon={faTrash} style={{ cursor: 'pointer', color: theme.palette.error.main }} onClick={() => {
                        setIdMedico(row.original.id);
                        setModal({
                            open: true, type: 'delete', title: 'Eliminar Médico',
                            message: `¿Desea borrar al médico ${row.original.apellido}, ${row.original.nombre}?`,
                            severity: 'error', contentRTF: false,
                        });
                    }} />
                </Tooltip>
            </Box>
        ),
    });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h1" className="page-title" color="primary" sx={{ mb: 3 }}>
                Gestión de Médicos
            </Typography>
            
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            
            <MaterialReactTable table={table} />
            
            <ConfirmDialog
                title={modal.title} message={modal.message} openDialog={modal.open} severity={modal.severity} contentRTF={modal.contentRTF}
                handleCloseDialog={() => setModal(prev => ({ ...prev, open: false }))}
                handleOKButton={() => {
                    setModal(prev => ({ ...prev, open: false }));
                    if (modal.type === 'delete' && idMedico) deleteMedico(idMedico);
                }}
            />

            <Snackbar 
                open={snackData.open} autoHideDuration={4000} 
                onClose={() => setSnackData(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackData.type} variant="filled" sx={{ width: '100%' }}>
                    {snackData.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MedicosListPage;