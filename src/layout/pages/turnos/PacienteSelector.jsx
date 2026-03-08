import React, { useEffect, useState } from "react";
import { listarPacientes } from "../../../services/pacientes.service";
import { Autocomplete, TextField, Box, Typography } from "@mui/material";

export const PacienteSelector = ({ turno, paciente, onSelect }) => {
    const [pacientes, setPacientes] = useState([]);

    useEffect(() => {
        listarPacientes().then(setPacientes);
    }, []);

    return (
        <Box sx={{ width: '100%' }}>
            <Autocomplete
                // Si paciente no tiene ID, devolvemos null para que el placeholder sea visible
                value={paciente?.id ? paciente : null}
                options={pacientes}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                // Evitamos que opciones nulas rompan el renderizado
                getOptionLabel={(option) => 
                    option ? `${option.nombre} ${option.apellido} (DNI: ${option.dni})` : ""
                }
                // Sincronización con el estado del padre
                onChange={(event, newValue) => {
                    onSelect(newValue || { id: null, nombre: "", apellido: "", dni: "" });
                }}
                // Para que los nombres largos no se corten en la lista desplegable
                renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.id}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {option.apellido.toUpperCase()}, {option.nombre} 
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            - DNI: {option.dni}
                        </Typography>
                    </Box>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Paciente *"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        error={turno.dni.error}
                        helperText={turno.dni.error ? "Debe seleccionar un paciente de la lista" : ""}
                        sx={{
                            // Aseguramos que el texto dentro del input tenga espacio
                            '& .MuiInputBase-root': {
                                paddingRight: '48px !important'
                            }
                        }}
                    />
                )}
                // Traducción de textos de ayuda del componente
                noOptionsText="No se encontraron pacientes"
                loadingText="Cargando..."
            />

            {/* Campo oculto para compatibilidad con el envío del formulario si fuera necesario */}
            <input 
                type="hidden" 
                name="pacienteid" 
                value={paciente?.id || ""} 
            />
        </Box>
    );
};
