import React, { useState, useEffect, useCallback, useMemo } from "react";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import {
    listarFechasConTurno,
    listarTurnosDeFecha,
    listarTurnos
} from "../../../services/turnos.service";
import { DateSelector } from "./DateSelector";
import { TurnosTable } from "./TurnosTable";
import dayjs from "dayjs";
import {
    IconButton,
    LinearProgress,
    Tab,
    Tabs,
    TextField,
    InputAdornment,
    FormControlLabel,
    Switch,
    Stack,
    Button,
    Typography as MuiTypography
} from "@mui/material";
import { faChevronLeft, faChevronRight, faClipboardList, faCalendarDays, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { TurnosCalendar } from "./TurnosCalendar";
import { DATE_FORMAT } from "../../libs/constants";

const TabPanel = ({ children, value, index }) => {
    if (value !== index) return null;
    return <div role="tabpanel">{children}</div>;
};

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

const normalizeText = (v) => (v || "").toString().toLowerCase().trim();

const TurnosListPage = () => {
    const [fecha, setFecha] = useState(dayjs());
    const [data, setData] = useState([]);
    const [highlightedDays, setHighlightedDays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [showAll, setShowAll] = useState(false);
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    const loadTurnos = useCallback(async (date, loadAll = false) => {
        if (loadAll) {
            const turnos = await listarTurnos();
            setData(Array.isArray(turnos) ? turnos : []);
            return;
        }

        const dateToLoad = dayjs(date);
        if (!dateToLoad.isValid()) {
            setData([]);
            return;
        }

        const formattedDate = dateToLoad.format(DATE_FORMAT);
        const turnos = await listarTurnosDeFecha(formattedDate);
        setData(Array.isArray(turnos) ? turnos : []);
    }, []);

    const loadFechasDelMes = useCallback(async (date) => {
        const dateToLoad = dayjs(date);
        if (!dateToLoad.isValid()) {
            setHighlightedDays([]);
            return;
        }

        const month = dateToLoad.month() + 1;
        const fechas = await listarFechasConTurno(month);

        const fechasFormateadas = Array.isArray(fechas)
            ? fechas.map((d) => dayjs(d).format(DATE_FORMAT))
            : [];

        setHighlightedDays(fechasFormateadas);
    }, []);

    const loadAll = useCallback(async (date, loadAllMode = showAll) => {
        setLoading(true);
        try {
            if (loadAllMode) {
                await loadTurnos(date, true);
                setHighlightedDays([]);
            } else {
                await Promise.all([
                    loadTurnos(date, false),
                    loadFechasDelMes(date)
                ]);
            }
        } catch (err) {
            console.error("Error cargando turnos:", err);
            setData([]);
            setHighlightedDays([]);
        } finally {
            setLoading(false);
        }
    }, [loadTurnos, loadFechasDelMes, showAll]);

    useEffect(() => {
        loadAll(fecha, showAll);
    }, [showAll]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedQuery(query);
        }, 350);

        return () => clearTimeout(timeout);
    }, [query]);

    const handleDateChange = (newDate) => {
        const parsed = dayjs(newDate);
        setFecha(parsed);
        if (!showAll) loadAll(parsed, false);
    };

    const handleMonthChange = (newDate) => {
        if (!showAll) loadFechasDelMes(newDate);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const searchIndex = useMemo(() => {
        const base = Array.isArray(data) ? data : [];
        return base.map((t) => {
            const searchable = [
                t.paciente || t.nombrePaciente,
                t.medico || t.nombreMedico || t.doctor,
                t.pacienteDni || t.dni || t.paciente_dni,
                dayjs(t.fecha).isValid() ? dayjs(t.fecha).format("DD/MM/YYYY") : "",
                t.hora
            ].map(normalizeText).join(" ");
            return { row: t, search: searchable };
        });
    }, [data]);

    const filteredData = useMemo(() => {
        const q = normalizeText(debouncedQuery);
        if (!q) return searchIndex.map((x) => x.row);

        return searchIndex
            .filter((x) => x.search.includes(q))
            .map((x) => x.row);
    }, [searchIndex, debouncedQuery]);

    return (
        <Box sx={{ p: { xs: 1.5, md: 3 }, width: "100%" }}>
            <Typography variant="h1" className="page-title" color="primary" sx={{ mb: 3 }}>
                Lista de Turnos
            </Typography>

            {loading && (
                <Box sx={{ width: "100%" }}>
                    <LinearProgress />
                </Box>
            )}

            <Tabs value={tabValue} onChange={handleTabChange} sx={{ "& button": { minWidth: "15rem" } }}>
                <Tab icon={<FontAwesomeIcon icon={faClipboardList} size="lg" />} iconPosition="start" label="Detalle" />
                <Tab icon={<FontAwesomeIcon icon={faCalendarDays} size="lg" />} iconPosition="start" label="Resumen" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 1, mb: 1, alignItems: { md: "center" } }}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Buscar por paciente, DNI o medico"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                </InputAdornment>
                            )
                        }}
                    />
                    <Button
                        variant="outlined"
                        onClick={() => setQuery("")}
                        disabled={!query}
                    >
                        Limpiar
                    </Button>
                    <FormControlLabel
                        control={<Switch checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />}
                        label="Ver todos"
                    />
                </Stack>
                <MuiTypography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {filteredData.length} resultado(s)
                </MuiTypography>

                {!showAll && (
                    <Grid
                        container
                        alignItems="center"
                        justifyContent="center"
                        sx={{ mt: 1, pt: 1, backgroundColor: "var(--fc-header-toolbar-bg-color)" }}
                    >
                        <Grid item xs={1} sx={{ textAlign: "center" }}>
                            <IconButton onClick={() => handleDateChange(fecha.subtract(1, "day"))}>
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </IconButton>
                        </Grid>

                        <Grid item xs={10} md={3} sx={{ textAlign: "center" }}>
                            <DateSelector
                                fecha={fecha}
                                onDateChange={handleDateChange}
                                onMonthChange={handleMonthChange}
                                fechasconturno={highlightedDays}
                            />
                        </Grid>

                        <Grid item xs={1} sx={{ textAlign: "center" }}>
                            <IconButton onClick={() => handleDateChange(fecha.add(1, "day"))}>
                                <FontAwesomeIcon icon={faChevronRight} />
                            </IconButton>
                        </Grid>
                    </Grid>
                )}

                <TurnosTable
                    fecha={fecha}
                    data={filteredData}
                    loadData={() => loadAll(fecha, showAll)}
                />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <TurnosCalendar
                    key={fecha.format(DATE_FORMAT)}
                    dte={fecha}
                    handleDateChange={handleDateChange}
                    setTabValue={setTabValue}
                />
            </TabPanel>
        </Box>
    );
};

export default TurnosListPage;
