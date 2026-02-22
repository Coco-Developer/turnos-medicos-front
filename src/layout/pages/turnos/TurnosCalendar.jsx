import React, {useEffect, useRef} from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import esLocale from "@fullcalendar/core/locales/es";
import {listarCalendarData} from "../../../services/turnos.service";
import dayjs from "dayjs";
import 'dayjs/locale/es';

export const TurnosCalendar = ({ dte, handleDateChange, setTabValue }) => {
    const calendarRef = useRef(null);
    //--------------------------------------------------------------------------
    useEffect(() => {
        const calendarApi = calendarRef.current?.getApi?.();
        if (calendarApi && dte?.isValid?.()) {
            calendarApi.gotoDate(dte.toISOString());
        }
    }, [dte]);
    //--------------------------------------------------------------------------
    const handleEvents = async (fetchInfo, successCallback, failureCallback) => {
        try {
            const data = await listarCalendarData(fetchInfo.startStr, fetchInfo.endStr);
            const events = data.map(ev => ({
                ...ev,
                allDay: true
            }));

            successCallback(events);
        } catch (err) {
            failureCallback(err);
        }
    };
    //--------------------------------------------------------------------------
    const handleEventClick = (info) => {
        const fechaEvento = dayjs(info.event.start);
        handleDateChange(fechaEvento);
        setTabValue(0);
    }
    //**************************************************************************
    //**************************************************************************
    //**************************************************************************
    return (
        <FullCalendar
            ref={calendarRef}
            plugins={[ dayGridPlugin ]}
            initialView="dayGridMonth"
            initialDate={dte.toISOString()}
            locale={esLocale}
            events={handleEvents}
            titleFormat={(d) => {
                const dte = d.date;
                const raw = dayjs().locale('es').year(dte.year).month(dte.month).format('MMMM [de] YYYY');
                return raw.charAt(0).toUpperCase() +  raw.slice(1);
            }}
            eventClick={handleEventClick}
        />
    )
}