import React, { useState, useEffect } from "react";
import { TextField, Box } from "@mui/material";

export const ObservacionesInput = ({ turno, onChange }) => {
    // Estado local para escritura fluida sin lag
    const [localValue, setLocalValue] = useState(turno.observaciones.dato || "");

    // Sincronizar si el valor cambia externamente (ej: al cargar un turno para editar)
    useEffect(() => {
        setLocalValue(turno.observaciones.dato || "");
    }, [turno.observaciones.dato]);

    const handleBlur = () => {
        // Solo disparamos el cambio global al perder el foco
        onChange({
            target: {
                name: turno.observaciones.campo,
                value: localValue
            }
        });
    };

    return (
        <Box sx={{ width: '100%' }}>
            <TextField
                fullWidth
                multiline
                rows={4}
                label="Observaciones"
                variant="outlined"
                margin="normal"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                placeholder="Notas adicionales sobre el turno..."
            />
        </Box>
    );
};