
import { useState, useEffect, useMemo } from "react";
import Typography from "@mui/material/Typography";
import {
    useTheme,
    LinearProgress,
    Tooltip,
    Alert,
    Snackbar, Paper, TableContainer, Table, TableHead, TableBody, TableRow, TableCell,
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { MaterialReactTable, useMaterialReactTable, } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import ConfirmDialog from "../../elements/ConfirmDialog";
import {borrarMedico, listarMedicos, obtenerHorarioMedico} from "../../../services/medicos.service";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlus, faPen, faTrash, faClock } from '@fortawesome/free-solid-svg-icons'
import { listarTurnosDeMedico } from "../../../services/turnos.service";
import {useNavigate} from "react-router-dom";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const MedicosListPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [idMedico, setIdMedico] = useState(0);
    const [modal, setModal] = useState({
        open: false,
        title: '',
        message: '',
        contentRTF: false
    });

    const dataSnack = {
        type: 'info',
        message: '',
        open: false
    }
    const [snackData, setSnackData] = useState(dataSnack)

    const days = [
        {key: "lun", label: "Lunes"},
        {key: "mar", label: "Martes"},
        {key: "mie", label: "Miércoles"},
        {key: "jue", label: "Jueves"},
        {key: "vie", label: "Viernes"},
        {key: "sab", label: "Sábado"},
        {key: "dom", label: "Domingo"},
    ];
    //--------------------------------------------------------------------------
    const loadData = () => {
        setLoading(true);

        listarMedicos().then( (r) => {
            console.log('Load: ', r);
            setData(r);
            setLoading(false);
        });
    }
    //--------------------------------------------------------------------------
    useEffect(() => {
        loadData();
    }, []);
    //--------------------------------------------------------------------------
    const deleteMedico = (id) => {
        listarTurnosDeMedico(id).then( (r) => {
            if (r.length === 0) {
                console.log('DELETE');
                borrarMedico(id).then((r) => {
                    if (r !== '0') {
                        setSnackData({
                            type: 'success',
                            message: 'Datos borrados correctamente.',
                            open: true
                        })
                        loadData();
                    } else {
                        setSnackData({
                            type: 'error',
                            message: 'Hubo un error al borrar. Vuelva a intentarlo.',
                            open: true
                        })
                    }
                });
            }
            else {
                const errorText = r.statusText ?? 'El médico tiene turnos asignados. No se puede borrar.';
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
        setIdMedico(row.original.id);
        setModal({
            open: true,
            title: 'Eliminación',
            message: `¿Confirma la eliminación del medico: ${row.original.nombre} ${row.original.apellido}?`,
            severity: 'error',
            type: 'delete',
            contentRTF: false,
        });
    };
    //--------------------------------------------------------------------------
    const getHorarioMedico = (row, setDialog) => {

        const id = row.original.id;

        obtenerHorarioMedico(id).then((r) => {
            const inicioRow = [];
            const finRow = [];

            for (const [ndx, day]  of days.entries()) {
                if (r) {
                    const horario = r.find((h) => h.diaSemana === ndx + 1);

                inicioRow.push(horario ? dayjs(horario.horarioAtencionInicio, 'HH:mm:ss').format('HH:mm') : "");
                finRow.push(horario ? dayjs(horario.horarioAtencionFin, 'HH:mm:ss').format('HH:mm') : "");
                }
            }

            const thStyle = { height: '6rem', p: 0, m: 0, borderRight: '1px solid #fff' };

            const horarios = (
                <>
                    <TableContainer component={Paper} sx={{ mt: 2, mx: 0, pb:4,}}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={thStyle}></TableCell>
                                    {days.map((d) => (
                                        <TableCell key={d.key} align="center" className="rotate-90" sx={thStyle}>
                                                {d.label}
                                        </TableCell>
                                    ))}
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Inicio</TableCell>
                                    {inicioRow.map((col, idx) => (
                                        <TableCell key={idx} align="center">
                                            {col}
                                        </TableCell>
                                    ))}
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Fin</TableCell>
                                    {finRow.map((col, idx) => (
                                        <TableCell key={idx} align="center">
                                            {col}
                                        </TableCell>
                                    ))}
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            );

            setDialog({
                open: true,
                title: `Horario de ${row.original.apellido}, ${row.original.nombre}`,
                message: horarios,
                severity: 'info',
                type: 'info',
                contentRTF: true,
            });
        })
        .catch((error) => {
            const errorText = error.statusText ?? 'No se encuentran horarios asignados.';
            setSnackData({
                type: 'error',
                message: errorText,
                open: true
            })
        });

    };
    //--------------------------------------------------------------------------
    const openInfoConfirmModal = (row) => {
        getHorarioMedico(row, setModal);
    };
    //--------------------------------------------------------------------------
    const handleSnackClose = () => {
        setSnackData(dataSnack);
    };
    //--------------------------------------------------------------------------
    const columns = useMemo(
        () => [
            {
                accessorKey: 'foto',
                header: 'Foto',
                size: 6,
                enableSorting: false,
                enableColumnFilter: false,
                Cell: ({ renderedCellValue, row }) => (
                    <Box
                    >
                        <img
                            alt="Foto"
                            height={30}
                            src={`data:image/jpeg;base64,${row.original.foto}`}
                            loading="lazy"
                            style={{ borderRadius: '50%', border: '1px solid var(--mui-palette-primary-main)', }}
                        />
                    </Box>
                ),
            },
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
                accessorKey: 'especialidad',
                header: 'Especialidad',
                size: 70,
            },
            {
                accessorKey: 'matricula',
                header: 'Matrícula',
                size: 50,
            },
        ],
        [],
    );

    //--------------------------------------------------------------------------
    //console.log(data);
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
                    onClick={() => navigate("/medicos/form")}
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
                <Tooltip title="Horario">
                    <FontAwesomeIcon icon={faClock} color={theme.palette.grey["600"]} size="lg" className="action-icon" onClick={() => openInfoConfirmModal(row)} />
                </Tooltip>
                <Tooltip title="Editar">
                    <FontAwesomeIcon icon={faPen} color={theme.palette.grey["700"]} size="lg" className="action-icon" onClick={() => navigate("/medicos/form/" + row.original.id)} />
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
                Lista de Médicos
            </Typography>
            {loading? <Box sx={{ width: '100%' }}><LinearProgress /></Box>:""}

            <MaterialReactTable table={table}  />

            <ConfirmDialog
                title={modal.title}
                message={modal.message}
                severity={modal.severity}
                openDialog={modal.open}
                handleOKButton={() => {
                    if (modal.type === 'delete') {
                        deleteMedico(idMedico)
                    }
                    else {
                        setModal(false);
                    }
                }}
                handleCloseDialog={() => setModal(false)}
                contentRTF={modal.contentRTF}
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

export default MedicosListPage;