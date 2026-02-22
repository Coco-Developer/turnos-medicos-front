import {TextField} from "@mui/material";
import Grid from '@mui/material/Grid';

export const ObservacionesInput = ({ turno, setTurno, onChange }) => (
    <Grid size={{ xs: 12, md: 10 }}>
        <TextField
            name={turno.observaciones.campo}
            label="Observaciones"
            variant="outlined"
            fullWidth
            margin="normal"
            required={turno.observaciones.requerido}
            onChange={onChange}
            value={turno.observaciones.dato}
        />
    </Grid>
);