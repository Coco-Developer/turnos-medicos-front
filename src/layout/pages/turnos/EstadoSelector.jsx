import {useEffect, useState} from "react";
import {listarEstados} from "../../../services/estados.service";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import Grid from '@mui/material/Grid';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export const EstadoSelector = ({ turno, setTurno, onChange }) => {
    const [estados, setEstados] = useState([]);

    useEffect(() => {
        listarEstados().then(setEstados);
    }, []);

    return (
        <Grid size={{ xs: 12, md: 3 }}>
            <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel error={turno.estadoid.error}>Estado</InputLabel>
                <Select
                    value={turno.estadoid.dato}
                    error={turno.estadoid.error}
                    label='Estado'
                    onChange={onChange}
                    variant="outlined"
                >
                    {estados.map(est => (
                        <MenuItem key={est.id} value={est.id} className={est.clase}>
                            <FontAwesomeIcon icon={est.icono} size="lg" /> {est.nombre}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>
    );
};