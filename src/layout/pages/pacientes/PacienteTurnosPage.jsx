
import { useState, useEffect, useMemo } from "react";
import Typography from "@mui/material/Typography";
import {
    useTheme,
    LinearProgress,
    Tooltip,
} from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Box from "@mui/material/Box";
import { MaterialReactTable, useMaterialReactTable, } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { listarTurnosPaciente } from "../../../services/turnos.service";
import { obtenerPaciente } from "../../../services/pacientes.service";
import {useParams} from "react-router-dom";
import dayjs from "dayjs";
import {faEnvelope, faIdCard, faPhone, faUser} from "@fortawesome/free-solid-svg-icons";

const PacienteTurnosPage = () => {
    const { id } = useParams();
    const theme = useTheme();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paciente, setPaciente] = useState('');
    //--------------------------------------------------------------------------
    const loadData = () => {
        setLoading(true);

        listarTurnosPaciente(id).then( (r) => {
            setData(r);
            loadPaciente(id);

            setLoading(false);
            //console.log(r);
        });
    }

    const loadPaciente = (id) =>{
        obtenerPaciente(id).then((r) => {
            const dniFormateado = new Intl.NumberFormat(
                "es-ES", {
                    style: 'decimal',
                    maximumFractionDigits: 0,
                    useGrouping: true,
            }).format(r.dni);


            setPaciente({
                'nombre': `${r.apellido}, ${r.nombre} `,
                'dni': dniFormateado,
                'telefono': r.telefono,
                'email': r.email,
            });
        });
    }

    //--------------------------------------------------------------------------
    useEffect(() => {
        loadData();
    }, []);
    //--------------------------------------------------------------------------
    const columns = useMemo(
        () => [
            {
                accessorKey: 'fecha',
                header: 'Fecha',
                size: 20,
                Cell: ({ cell }) => dayjs(cell.getValue()).format('DD/MM/YYYY'),
            },
            {
                accessorKey: 'hora',
                header: 'Hora',
                size: 20,

            },
            {
                accessorKey: 'medico',
                header: 'Médico',
                size: 250,
                Cell: ({ renderedCellValue, row }) => (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                        }}
                    >
                        <img
                            alt="Foto"
                            height={30}
                            src={`data:image/jpeg;base64,${row.original.foto}`}
                            loading="lazy"
                            style={{ borderRadius: '50%', border: '1px solid var(--mui-palette-primary-main)', }}
                        />
                        <span>{renderedCellValue}</span>
                    </Box>
                ),
            },
            {
                accessorKey: 'especialidad',
                header: 'Especialidad',
                size: 100,
            },
            {
                accessorKey: 'estado',
                Cell: ({ cell, row }) => {
                    return <div className={row.original.estadoClase}><FontAwesomeIcon icon={row.original.estadoIcono} size="lg" />&nbsp;{cell.getValue()}</div>;
                },
                grow: false,
                header: 'Estado',
                size: 20,
            },
            {
                accessorKey: 'observaciones',
                header: 'Obs',
                size: 200,
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
                {id: 'fecha', desc: false},
                {id: 'hora', desc: false},
            ]
        },
        getRowId: (row) => row.id,
        positionToolbarAlertBanner: 'bottom',
        enableRowActions: false,
        positionActionsColumn: 'last',
    });
    //--------------------------------------------------------------------------
    if (!data) return null;
//==============================================================================
    return (
        <>
            <Typography variant="h1" className="page-title" color="primary">
                Turnos del Paciente
            </Typography>
            {loading? <Box sx={{ width: '100%' }}><LinearProgress /></Box>:""}
            <Typography variant="h2">
                <FontAwesomeIcon icon={faUser}  /> {paciente.nombre}
            </Typography>
            <Typography variant="p">
                <FontAwesomeIcon icon={faIdCard} style={{ color: theme.palette.secondary.main }} /> {paciente.dni}
                <FontAwesomeIcon icon={faPhone} style={{ color: theme.palette.secondary.main, marginLeft: '2rem' }} /> {paciente.telefono}
                <FontAwesomeIcon icon={faEnvelope} style={{ color: theme.palette.secondary.main, marginLeft: '2rem' }} /> {paciente.email}
            </Typography>

            <MaterialReactTable table={table}  />
        </>
    );
};
export default PacienteTurnosPage;