import React, { useEffect, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import esLocale from "@fullcalendar/core/locales/es";
import { listarCalendarData } from "../../../services/turnos.service";
import dayjs from "dayjs";
import "dayjs/locale/es";

export const TurnosCalendar = ({ dte, handleDateChange, setTabValue }) => {
    const compactCount = (value) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return String(value ?? "");
        if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(".0", "")}M`;
        if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}k`;
        return String(n);
    };

    const calendarRef = useRef(null);

    //------------------------------------------------------
    // Sincroniza cuando cambia la fecha desde afuera
    useEffect(() => {
        const calendarApi = calendarRef.current?.getApi?.();
        if (calendarApi && dayjs(dte).isValid()) {
            calendarApi.gotoDate(dayjs(dte).format("YYYY-MM-DD"));
        }
    }, [dte]);

    //------------------------------------------------------
    // Loader de eventos (FullCalendar async source)
    const handleEvents = useCallback(async (fetchInfo, successCallback, failureCallback) => {
        try {

            const response = await listarCalendarData(
                fetchInfo.startStr,
                fetchInfo.endStr
            );

            const dataSegura = Array.isArray(response) ? response : [];

            const events = dataSegura.map(ev => ({
                ...ev,
                title: compactCount(ev.title),
                start: dayjs(ev.start).format("YYYY-MM-DD"),
                allDay: true
            }));

            successCallback(events);

        } catch (error) {
            console.error("Error cargando calendario:", error);
            failureCallback(error);
        }
    }, []);

    //------------------------------------------------------
    // Click en evento → ir a detalle
    const handleEventClick = useCallback((info) => {
        const fechaEvento = dayjs(info.event.start);

        if (!fechaEvento.isValid()) return;

        handleDateChange(fechaEvento);
        setTabValue(0);

    }, [handleDateChange, setTabValue]);

    //------------------------------------------------------

    return (
        <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            locale={esLocale}
            events={handleEvents}
            eventClick={handleEventClick}
            height="auto"
            firstDay={1}
            titleFormat={(arg) => {
                const raw = dayjs()
                    .locale("es")
                    .year(arg.date.year)
                    .month(arg.date.month)
                    .format("MMMM [de] YYYY");

                return raw.charAt(0).toUpperCase() + raw.slice(1);
            }}
        />
    );
};
