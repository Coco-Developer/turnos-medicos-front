import {useEffect, useState} from "react";
import {listarPacientes} from "../../../services/pacientes.service";
import {Autocomplete, TextField} from "@mui/material";
import Grid from '@mui/material/Grid';
import * as React from "react";

export const PacienteSelector = ({ turno, paciente, onSelect }) => {
    const [pacientes, setPacientes] = useState([]);

    useEffect(() => {
        listarPacientes().then(setPacientes);
    }, []);

    return (
        <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
                value={paciente.id ? paciente : null}
                options={pacientes}
                getOptionLabel={(option) => `${option.nombre} ${option.apellido} (${option.dni})`}
                onChange={(event, newValue) => onSelect(newValue)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Paciente *"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        error={turno.dni.error}
                        helperText={turno.dni.error ? "Debe seleccionar el Paciente" : ""}
                    />
                )}
            />
            <TextField
                sx={{display:'none'}} // Sólo necesario para almacenar el dato, no hace falta mostrarlo
                id={turno.dni.campo}
                name={turno.dni.campo}
                label={turno.dni.rotulo}
                value={turno.dni.dato}
                inputProps={{ readOnly: true }} // Campo no editable
            />
        </Grid>
    );
};