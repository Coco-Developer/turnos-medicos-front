export const TIME_FORMAT = "HH:mm:ss";
export const DATE_FORMAT = "YYYY-MM-DD";

export const DAYS = [
    {key: "lun", label: "Lunes"},
    {key: "mar", label: "Martes"},
    {key: "mie", label: "Miércoles"},
    {key: "jue", label: "Jueves"},
    {key: "vie", label: "Viernes"},
    {key: "sab", label: "Sábado"},
    {key: "dom", label: "Domingo"},
];

export const DAYSMAP = Object.freeze({
    lun: 1,
    mar: 2,
    mie: 3,
    jue: 4,
    vie: 5,
    sab: 6,
    dom: 7,
});

export const NUM_DAYSMAP = Object.freeze(
    Object.fromEntries(Object.entries(DAYSMAP).map(([key, num]) => [num, key]))
);


export const DEFAULT_SCHEDULE_RANGE = Object.freeze({
    startHour: 9,
    endHour: 17,
    minHour: 8,
    maxHour: 20,
});
