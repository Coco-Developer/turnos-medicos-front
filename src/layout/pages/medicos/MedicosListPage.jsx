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
import { borrarMedico, listarMedicos, obtenerHorarioMedico, obtenerMedico } from "../../../services/medicos.service";
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
        { key: "mie", label: "Miercoles" }, { key: "jue", label: "Jueves" },
        { key: "vie", label: "Viernes" }, { key: "sab", label: "Sabado" },
        { key: "dom", label: "Domingo" },
    ];

    const normalizeScheduleItem = (h) => ({
        diaSemana: Number(h?.diaSemana ?? h?.DiaSemana ?? 0),
        horarioAtencionInicio:
            h?.horarioAtencionInicio ??
            h?.HorarioAtencionInicio ??
            h?.horaAtencionInicio ??
            h?.HoraAtencionInicio ??
            null,
        horarioAtencionFin:
            h?.horarioAtencionFin ??
            h?.HorarioAtencionFin ??
            h?.horaAtencionFin ??
            h?.HoraAtencionFin ??
            null,
    });

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
            setSnackData({ type: 'success', message: 'Medico eliminado. Actualizando lista...', open: true });
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
                    setSnackData({ type: 'error', message: 'No se puede borrar: El medico tiene turnos asignados.', open: true });
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

    const openInfoConfirmModal = async (row) => {
        const id = row.original.id;
        try {
            const fromScheduleEndpoint = await obtenerHorarioMedico(id);
            const medico = await obtenerMedico(id);
            const fromMedico = Array.isArray(medico?.horarios)
                ? medico.horarios
                : (Array.isArray(medico?.Horarios) ? medico.Horarios : []);

            const sourceRaw = Array.isArray(fromScheduleEndpoint) && fromScheduleEndpoint.length > 0
                ? fromScheduleEndpoint
                : fromMedico;

            const source = sourceRaw.map(normalizeScheduleItem);

            const inicioRow = [];
            const finRow = [];
            days.forEach((_, index) => {
                const diaSemanaBuscado = index + 1;
                const horario = source.find((h) => Number(h.diaSemana) === diaSemanaBuscado) || null;
                const ini = horario?.horarioAtencionInicio ? dayjs(horario.horarioAtencionInicio, 'HH:mm:ss').format('HH:mm') : "-";
                const fin = horario?.horarioAtencionFin ? dayjs(horario.horarioAtencionFin, 'HH:mm:ss').format('HH:mm') : "-";
                inicioRow.push(ini);
                finRow.push(fin);
            });

            const thStyle = { height: '3rem', p: 1, color: '#fff', borderRight: '1px solid rgba(255,255,255,0.2)', fontSize: '0.8rem' };
            const horariosTable = (
                <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 0, border: '1px solid #eee' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                                <TableCell sx={thStyle}>Dia</TableCell>
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
        } catch {
            setSnackData({ type: "error", message: "No se pudo cargar la agenda del medico.", open: true });
        }
    };

    // --- COLUMNAS OPTIMIZADAS (Anchos fijos para evitar expansion excesiva) ---
    const columns = useMemo(() => [
        {
            accessorKey: 'foto',
            header: '',
            size: 50, // Muy pequena para la foto
            enableColumnFilter: false,
            Cell: ({ row }) => (
                <img alt="F" height={32} width={32}
                    src={row.original.foto ? `data:image/jpeg;base64,${row.original.foto}` : '/default-avatar.png'}
                    style={{ borderRadius: '50%', objectFit: 'cover', border: `1px solid ${theme.palette.divider}` }}
                />
            ),
        },
        { accessorKey: 'matricula', header: 'Matricula', size: 100 },
        { accessorKey: 'apellido', header: 'Apellido', size: 150 },
        { accessorKey: 'nombre', header: 'Nombre', size: 150 },
        { accessorKey: 'telefono', header: 'Telefono', size: 120 },
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
        layoutMode: 'semantic',
        enableColumnResizing: true,
        muiTablePaperProps: {
            sx: { width: "100%", overflow: "hidden" }
        },
        muiTableContainerProps: {
            sx: {
                width: "100%",
                maxWidth: "100%",
                overflowX: "auto",
                maxHeight: { xs: "60dvh", md: "68dvh" }
            }
        },
        muiTableBodyProps: {
            sx: {
                '& tr:nth-of-type(odd) > td': {
                    backgroundColor: theme.palette.action.hover,
                },
            },
        },
        initialState: {
            density: 'compact', // <--- Mas pequena desde el inicio
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
                Anadir Medico
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
                            open: true, type: 'delete', title: 'Eliminar Medico',
                            message: `Desea borrar al medico ${row.original.apellido}, ${row.original.nombre}?`,
                            severity: 'error', contentRTF: false,
                        });
                    }} />
                </Tooltip>
            </Box>
        ),
    });

    return (
        <Box sx={{ p: { xs: 1.5, md: 3 }, width: "100%" }}>
            <Typography variant="h1" className="page-title" color="primary" sx={{ mb: 3 }}>
                Gestion de Medicos
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
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ mt: { xs: 8, sm: 10 } }}
            >
                <Alert severity={snackData.type} variant="filled" sx={{ width: '100%', maxWidth: { xs: '92vw', sm: 520 } }}>
                    {snackData.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MedicosListPage;

