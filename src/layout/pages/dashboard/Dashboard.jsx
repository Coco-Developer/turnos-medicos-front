import { useEffect, useMemo, useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { LinearProgress, Paper } from "@mui/material";
import Grid from "@mui/material/Grid";
import dayjs from "dayjs";
import { cantidadPacientes } from "../../../services/pacientes.service";
import { faCalendar, faCalendarCheck, faCircleCheck, faUser, faUserDoctor } from "@fortawesome/free-solid-svg-icons";
import { CircleChartWidget, CounterWidget, StackedBarChartWidget } from "../../elements/Widgets";
import { cantidadMedicos } from "../../../services/medicos.service";
import { listarTurnos } from "../../../services/turnos.service";
import { listarEstados } from "../../../services/estados.service";
import bgMed from "../../../assets/bkg-medicos.png";
import bgPac from "../../../assets/bkg-pacientes.png";
import bgMes from "../../../assets/bkg-turnos1.png";
import bgAnio from "../../../assets/bkg-turnos2.png";

const monthKey = (date) => dayjs(date).format("YYYY-MM");

const DashboardPage = () => {
    const [loading, setLoading] = useState(false);
    const [estados, setEstados] = useState([]);

    const [cantPac, setCantPac] = useState(0);
    const [cantMed, setCantMed] = useState(0);
    const [cantTurMo, setCantTurMo] = useState(0);
    const [cantTurYr, setCantTurYr] = useState(0);

    const [dataTurnosMo, setDataTurnosMo] = useState([]);
    const [dataTurnosYrLbl, setDataTurnosYrLbl] = useState([]);
    const [dataTurnosYr, setDataTurnosYr] = useState([]);
    const [dataTurnosPorMedicoYrLbl, setDataTurnosPorMedicoYrLbl] = useState([]);
    const [dataTurnosPorMedicoYr, setDataTurnosPorMedicoYr] = useState([]);

    const estadoColorMap = useMemo(() => {
        const map = {};
        estados.forEach((e) => {
            map[e.nombre] = e.color || "#888";
        });
        return map;
    }, [estados]);

    const fillFromTurns = (turnos) => {
        const now = dayjs();
        const currentYear = now.year();
        const currentMonth = now.format("YYYY-MM");

        const valid = Array.isArray(turnos) ? turnos : [];
        const turnsThisYear = valid.filter((t) => dayjs(t.fecha).year() === currentYear);
        const turnsThisMonth = turnsThisYear.filter((t) => monthKey(t.fecha) === currentMonth);
        const monthByState = turnsThisMonth.reduce((acc, t) => {
            const st = t.estado || "Desconocido";
            acc[st] = (acc[st] || 0) + 1;
            return acc;
        }, {});

        const monthPie = Object.entries(monthByState).map(([estado, value], i) => ({
            id: i,
            value,
            label: estado,
            color: estadoColorMap[estado] || "#888"
        }));
        setDataTurnosMo(monthPie);
        setCantTurMo(turnsThisMonth.length);

        const doneCount = turnsThisYear.filter((t) => (t.estado || "").toLowerCase() === "realizado").length;
        setCantTurYr(doneCount);

        const byMonthMap = {};
        turnsThisYear.forEach((t) => {
            const mo = dayjs(t.fecha).format("MM");
            const estado = t.estado || "Desconocido";
            if (!byMonthMap[mo]) {
                byMonthMap[mo] = { mo, ...Object.fromEntries(estados.map((s) => [s.nombre, 0])) };
                byMonthMap[mo][estado] = 0;
            }
            if (byMonthMap[mo][estado] === undefined) byMonthMap[mo][estado] = 0;
            byMonthMap[mo][estado] += 1;
        });

        const byMonth = Object.values(byMonthMap).sort((a, b) => Number(a.mo) - Number(b.mo));
        setDataTurnosYr(byMonth);
        setDataTurnosYrLbl(
            estados.map((s) => ({ dataKey: s.nombre, label: s.nombre, stack: "Mes", color: s.color || "#888" }))
        );

        const byDoctorMap = {};
        turnsThisYear.forEach((t) => {
            const medico = t.medico || "Sin medico";
            const estado = t.estado || "Desconocido";
            if (!byDoctorMap[medico]) {
                byDoctorMap[medico] = { medico, ...Object.fromEntries(estados.map((s) => [s.nombre, 0])) };
            }
            if (byDoctorMap[medico][estado] === undefined) byDoctorMap[medico][estado] = 0;
            byDoctorMap[medico][estado] += 1;
        });

        setDataTurnosPorMedicoYr(Object.values(byDoctorMap));
        setDataTurnosPorMedicoYrLbl(
            estados.map((s) => ({ dataKey: s.nombre, label: s.nombre, stack: "Medico", color: s.color || "#888" }))
        );
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [est, cp, cm, turns] = await Promise.all([
                    listarEstados(),
                    cantidadPacientes(),
                    cantidadMedicos(),
                    listarTurnos()
                ]);

                const estadosSafe = Array.isArray(est) ? est : [];
                setEstados(estadosSafe);
                setCantPac(typeof cp === "number" ? cp : 0);
                setCantMed(typeof cm === "number" ? cm : 0);

                setEstados(estadosSafe);
                fillFromTurns(Array.isArray(turns) ? turns : []);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    useEffect(() => {
        if (estados.length === 0) return;
        listarTurnos().then((turns) => fillFromTurns(turns));
    }, [estados]);

    return (
        <Box sx={{ p: { xs: 1.5, md: 3 }, width: "100%" }}>
            <Typography id="turnos-title" variant="h1" className="page-title" color="primary" tabIndex="-1" sx={{ mb: 3 }}>
                Dashboard
            </Typography>
            {loading ? <Box sx={{ width: "100%" }}><LinearProgress /></Box> : ""}
            <Paper elevation={0} sx={{ backgroundColor: "transparent", my: 1, p: 2 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <CounterWidget category="Pacientes" title={cantPac} icon={faUser} bgClass="background-primary-dark" bgImage={bgPac} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <CounterWidget category="Medicos" title={cantMed} icon={faUserDoctor} bgClass="background-primary-main" bgImage={bgMed} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <CounterWidget category="Turnos este mes" title={cantTurMo} icon={faCalendar} bgClass="background-secondary-dark" bgImage={bgMes} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <CounterWidget category="Realizados este ano" title={cantTurYr} icon={faCircleCheck} bgClass="background-secondary-main" bgImage={bgAnio} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CircleChartWidget title="Turnos este mes" chartData={dataTurnosMo} containerHeight="400px" icon={faCalendar} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <StackedBarChartWidget title="Turnos este ano" chartData={dataTurnosYr} chartLabels={dataTurnosYrLbl} containerHeight="400px" icon={faCalendarCheck} dataKeyPropName="mo" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 12 }}>
                        <StackedBarChartWidget title="Turnos por Medico este ano" chartData={dataTurnosPorMedicoYr} chartLabels={dataTurnosPorMedicoYrLbl} containerHeight="400px" icon={faUserDoctor} dataKeyPropName="medico" />
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default DashboardPage;
