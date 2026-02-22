
import Grid from '@mui/material/Grid';
import { TextField } from "@mui/material";
import {handleValidation} from "./FnGen";

export const PersonalInfoInputs = ({ medico, setMedico, onChange }) => {
    return (
        <>
            <Grid>
                <TextField
                    name={medico.apellido.campo}
                    label="Apellido"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={medico.apellido.requerido}
                    onChange={onChange}
                    onBlur={handleValidation(medico, setMedico)}
                    value={medico.apellido.dato}
                    error={medico.apellido.error}
                    helperText={medico.apellido.error ? "Debe ingresar el apellido" : ""}
                />
            </Grid>
            <Grid>
                <TextField
                    name={medico.nombre.campo}
                    label="Nombre"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required={medico.nombre.requerido}
                    onChange={onChange}
                    onBlur={handleValidation(medico, setMedico)}
                    value={medico.nombre.dato}
                    error={medico.nombre.error}
                    helperText={medico.nombre.error ? "Debe ingresar el nombre" : ""}
                />
            </Grid>
        </>
    );
};