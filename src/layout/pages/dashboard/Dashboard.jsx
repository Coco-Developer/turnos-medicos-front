
import {useEffect, useState} from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {LinearProgress, Paper, useTheme} from "@mui/material";
import Grid from '@mui/material/Grid';
import dayjs from "dayjs";
import {cantidadPacientes} from "../../../services/pacientes.service";
import {faCalendar, faCalendarCheck, faCircleCheck, faUser, faUserDoctor} from "@fortawesome/free-solid-svg-icons";
import {CircleChartWidget, CounterWidget, StackedBarChartWidget} from "../../elements/Widgets";
import {cantidadMedicos} from "../../../services/medicos.service";
import {obtenerDashboardData} from "../../../services/turnos.service";
import {listarEstados} from "../../../services/estados.service";
import bgMed from '../../../assets/bkg-medicos.png';
import bgPac from '../../../assets/bkg-pacientes.png';
import bgMes from '../../../assets/bkg-turnos1.png';
import bgAnio from '../../../assets/bkg-turnos2.png';


const DashboardPage = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const hoy = dayjs();
    //console.log('DASHBOARD');
    //--------------------------------------------------------------------------
    const [estados, setEstados] = useState([]);
    const loadEstados =  () => {
        listarEstados().then( (r) => {
            setEstados(r);
        });
    };
    //--------------------------------------------------------------------------
    const [cantPac, setCantPac] = useState(0);
    const loadCantidadPacientes =  () => {
        cantidadPacientes().then( (r) => {
            setCantPac(r);
        });
    };
    //--------------------------------------------------------------------------
    const [cantMed, setCantMed] = useState(0);
    const loadCantidadMedicos =  () => {
        cantidadMedicos().then( (r) => {
            setCantMed(r);
        });
    };
    //--------------------------------------------------------------------------
    const [cantTurMo, setCantTurMo] = useState(0);
    const [cantTurYr, setCantTurYr] = useState(0);
    const [dataTurnosMo, setDataTurnosMo] = useState([]);
    const [dataTurnosYrLbl, setDataTurnosYrLbl] = useState([]);
    const [dataTurnosYr, setDataTurnosYr] = useState([]);
    const [dataTurnosPorMedicoYrLbl, setDataTurnosPorMedicoYrLbl] = useState([]);
    const [dataTurnosPorMedicoYr, setDataTurnosPorMedicoYr] = useState([]);

    const loadCantidadTurnos =  () => {
        obtenerDashboardData().then( (r) => {
            loadCantidadTurnosEsteMes(r['qtyTurnosMo']);
            loadCantidadTurnosEsteAnioCount(r['qtyTurnosYr']);
            loadCantidadTurnosEsteAnioBarras(r['qtyStatesYr']);
            loadCantidadTurnosPorMedicoEsteAnioBarras(r['qtyTurnosXMedico']);
        });
    };
    //--------------------------------------------------------------------------
    const loadCantidadTurnosEsteMes = (t) => {
        const sum = t.reduce(
            (acc, curr) => acc + curr.countId,
            0,
        );
        const dummy = t.map(
            (x, i) => {
                return { id: i, value: x.countId, label: x.estado, color: x.color };
            }
        );
        setDataTurnosMo(dummy);
        setCantTurMo(sum);
    }
    //--------------------------------------------------------------------------
    const loadCantidadTurnosEsteAnioCount =  (t) => {
        const sum = t.reduce(
                 (acc, curr) => {
                     if (curr.estado === 'Realizado'){
                         acc += curr.countId;
                     }
                     return acc;
                 },
                 0,
             );

        setCantTurYr(sum);
     };
    //--------------------------------------------------------------------------
    const loadCantidadTurnosEsteAnioBarras =  (t) => {
        let clr = '#888';
        const dummy = t.map(
            (x, i) => {
                const {yr, ...y} = x;
                return y;
            }
        );

        const k = Object.keys(dummy[0]);
        const labelsOfChart =  k.flatMap(
            (lbl, i) => {
                if (lbl === 'mo') {
                    return [];
                }

                // Como la carga de los Estados falla en primera llamada,
                // la mejor solución es un valor por defecto para que no
                // salte un error crítico.
                const dummy2 = estados.find((y)=>{return y.nombre === lbl});
                if (dummy2 !== undefined) {
                    clr = dummy2.color;
                }

                return { dataKey: lbl, label: lbl, stack: 'Mes', color: clr };
            }
        )
        //console.log('TurnosYr: ',dummy);
        setDataTurnosYr(dummy);
        setDataTurnosYrLbl(labelsOfChart);
    };

    //--------------------------------------------------------------------------
    const loadCantidadTurnosPorMedicoEsteAnioBarras =  (t) => {
        let clr = '#888';

        if (!Array.isArray(t) || t.length === 0) {
            setDataTurnosPorMedicoYr([]);
            setDataTurnosPorMedicoYrLbl([]);
            return;
        }

        // Agrupar por médico e inicializar con todos los estados en 0 usando el NOMBRE como clave
        const agrupado = t.reduce((acu, { medico, estado, countId }) => {
            if (!acu[medico]) {
                acu[medico] = {
                    medico,
                    ...Object.fromEntries(estados.map(s => [s.nombre, 0]))
                };
            }

            // Si llega un estado no listado en `estados`, lo inicializamos a 0
            if (!(estado in acu[medico])) {
                acu[medico][estado] = 0;
            }

            // Sumar asegurando números
            acu[medico][estado] = (acu[medico][estado] ?? 0) + (Number(countId) || 0);
            return acu;
        }, {});
        // Pasar a array
        const dummy = Object.values(agrupado);
        //console.log('Dummy: ',dummy);

        const labelsOfChart = estados.map(s => ({
            dataKey: s.nombre,
            label: s.nombre,
            stack: 'Medico',
            color: s.color
        }));

        setDataTurnosPorMedicoYr(dummy);
        setDataTurnosPorMedicoYrLbl(labelsOfChart);
    };

    //--------------------------------------------------------------------------
    useEffect(() => {
        loadEstados();
    }, []);

    useEffect(() => {
        if (estados.length > 0) {
            loadCantidadPacientes();
            loadCantidadMedicos();
            loadCantidadTurnos();
        }
    }, [estados]);

    return (
        <>
            <Typography id="turnos-title" variant="h1" className="page-title" color="primary" tabIndex="-1">
                Dashboard
            </Typography>
            {loading? <Box sx={{ width: '100%' }}><LinearProgress /></Box>:""}
            <Paper elevation={0} sx={{ backgroundColor: 'transparent', my: 1, p: 2 }}>
                <Grid container spacing={2} >
                    <Grid size={{ xs: 12, md: 3 }}>
                        <CounterWidget
                            category="Pacientes"
                            title={cantPac}
                            icon={faUser}
                            bgClass="background-primary-dark"
                            bgImage={bgPac}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <CounterWidget
                            category="Médicos"
                            title={cantMed}
                            icon={faUserDoctor}
                            bgClass="background-primary-main"
                            bgImage={bgMed}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <CounterWidget
                            category="Turnos este mes"
                            title={cantTurMo}
                            icon={faCalendar}
                            bgClass="background-secondary-dark"
                            bgImage={bgMes}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <CounterWidget
                            category="Realizados este año"
                            title={cantTurYr}
                            icon={faCircleCheck}
                            bgClass="background-secondary-main"
                            bgImage={bgAnio}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CircleChartWidget
                            title="Turnos este mes"
                            chartData={dataTurnosMo}
                            containerHeight="400px"
                            icon={faCalendar}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <StackedBarChartWidget
                            title="Turnos este año"
                            chartData={dataTurnosYr}
                            chartLabels={dataTurnosYrLbl}
                            containerHeight="400px"
                            icon={faCalendarCheck}
                            dataKeyPropName="mo"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 12 }}>
                        <StackedBarChartWidget
                            title="Turnos por Médico este año"
                            chartData={dataTurnosPorMedicoYr}
                            chartLabels={dataTurnosPorMedicoYrLbl}
                            containerHeight="400px"
                            icon={faUserDoctor}
                            dataKeyPropName="medico"
                        />
                    </Grid>

                </Grid>
            </Paper>
        </>
    );
};

export default DashboardPage;