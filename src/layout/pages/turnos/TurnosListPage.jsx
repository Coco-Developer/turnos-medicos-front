import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Grid from '@mui/material/Grid';
import Box from "@mui/material/Box";
import { listarFechasConTurno, listarTurnosDeFecha } from "../../../services/turnos.service";
import {DateSelector} from "./DateSelector";
import {TurnosTable} from "./TurnosTable";
import dayjs from "dayjs";
import {IconButton, LinearProgress, Tab, Tabs} from "@mui/material";
import {faChevronLeft, faChevronRight, faClipboardList, faCalendarDays} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import {TurnosCalendar} from "./TurnosCalendar";
import {DATE_FORMAT} from "../../libs/constants";
//------------------------------------------------------------------------------
const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`turnos-tabpanel-${index}`}
            aria-labelledby={`turnos-tab-${index}`}
            {...other}
        >
            {value === index && <>{children}</>}
        </div>
    );
}
//------------------------------------------------------------------------------
TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};
//------------------------------------------------------------------------------
function a11yProps(index) {
    return {
        id: `turnos-tab-${index}`,
        'aria-controls': `turnos-tabpanel-${index}`,
    };
}
//------------------------------------------------------------------------------
const TurnosListPage = () => {
    const [fecha, setFecha] = useState(dayjs());
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [highlightedDays, setHighlitedDays] = useState([]);
    const [estadosCargados, setEstadosCargados] = useState(false);
    const [value, setValue] = useState(0);
    //--------------------------------------------------------------------------
    const handleTabChange = (event, newValue) => {
        setValue(newValue);
        loadDataAll(fecha);
    };
    //--------------------------------------------------------------------------
    const loadDataAll = (dte = 0) => {
        setLoading(true);

        const dateToLoad = dte === 0 ? dayjs() : dayjs(dte);
        if (!dateToLoad.isValid()) {
            setLoading(false);
            return;
        }

        const formattedDate = dateToLoad.format(DATE_FORMAT);
        const month = dateToLoad.month() + 1;

        Promise.all([
            listarTurnosDeFecha(formattedDate),
            listarFechasConTurno(month),
        ]).then(([turnos, fechasConTurno]) => {
            setData(turnos);
            const fechasMarcar = fechasConTurno.map(d => dayjs(d).format(DATE_FORMAT));
            setHighlitedDays(fechasMarcar);
        }).finally(() => {
            setLoading(false);
        });
    };
    //--------------------------------------------------------------------------
    const loadDataFechasConTurno = (dte = 0) => {
        const dateToLoad = dte === 0 ? dayjs() : dayjs(dte);

        if (!dateToLoad.isValid()) {
            setLoading(false);
            return;
        }

        const month = dateToLoad.month() + 1;
        listarFechasConTurno(month).then(fechasConTurno => {
            const fechasMarcar = fechasConTurno.map(d => dayjs(d).format(DATE_FORMAT));
            setHighlitedDays(fechasMarcar);
        });
    };
    //--------------------------------------------------------------------------
    useEffect(() => {
        if (estadosCargados) {
            loadDataAll();
        }
    }, [estadosCargados]);
    //--------------------------------------------------------------------------
    const handleDateChange = (dte) => {
        setFecha(dte);
        loadDataAll(dayjs(dte).format(DATE_FORMAT));
    };
    //--------------------------------------------------------------------------
    const handleMonthChange = (dte) => {
        loadDataFechasConTurno(dayjs(dte).format(DATE_FORMAT));
    }
    //--------------------------------------------------------------------------
    if (!data) return null;

    //**************************************************************************
    //**************************************************************************
    //**************************************************************************
    return (
        <>
            <Typography id="turnos-title" variant="h1" className="page-title" color="primary" tabIndex="-1">
                Lista de Turnos
            </Typography>
            {loading && <Box sx={{ width: '100%' }}><LinearProgress /></Box>}

            <Tabs
                value={value}
                onChange={handleTabChange}
                aria-label="Selector de vista"
                sx={{
                    "& button": {
                        minWidth: '15rem',
                    }
                }}
            >
                <Tab icon={<FontAwesomeIcon icon={faClipboardList} size="lg" />} iconPosition="start" label="Detalle" {...a11yProps(0)} />
                <Tab icon={<FontAwesomeIcon icon={faCalendarDays} size="lg" />} iconPosition="start" label="Resumen" {...a11yProps(1)} />
            </Tabs>

            <TabPanel value={value} index={0}>
                <Grid
                    container
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    sx={{marginTop: '.5rem',
                        paddingTop: '.5rem',
                        backgroundColor: 'var(--fc-header-toolbar-bg-color)'}}
                >
                    <Grid size={1} sx={{textAlign: 'center'}}>
                        <IconButton onClick={() => handleDateChange(dayjs(fecha).add(-1, 'day'))}>
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </IconButton>
                    </Grid>
                    <Grid size={{ xs: 10, md: 3 }} sx={{textAlign: 'center'}}>
                        <DateSelector
                            fecha={fecha}
                            onDateChange={handleDateChange}
                            onMonthChange={handleMonthChange}
                            fechasconturno={highlightedDays}
                        />
                    </Grid>
                    <Grid size={1} sx={{textAlign: 'center'}}>
                        <IconButton onClick={() => handleDateChange(dayjs(fecha).add(1, 'day'))}>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </IconButton>
                    </Grid>
                </Grid>
                <TurnosTable
                    fecha={fecha}
                    data={data}
                    loadData={loadDataAll}
                    setEstadosCargados={setEstadosCargados}
                />
            </TabPanel >
            <TabPanel value={value} index={1}>
                <TurnosCalendar
                    key={fecha.format(DATE_FORMAT)}
                    dte={fecha}
                    handleDateChange={handleDateChange}
                    setTabValue={setValue}
                />
            </TabPanel>
        </>
    );
};

export default TurnosListPage;