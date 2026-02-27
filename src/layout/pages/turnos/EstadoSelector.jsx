import { useEffect, useState } from "react";
import { FormControl, InputLabel, MenuItem, Select, Box, Typography } from "@mui/material";
import Grid from '@mui/material/Grid';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// Importación de los iconos necesarios según los nombres del script SQL
import { 
    faClock, 
    faCircleCheck, 
    faBan, 
    faCheckDouble, 
    faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';

// Servicio
import { listarEstados } from "../../../services/estados.service";

export const EstadoSelector = ({ turno, onChange }) => {
    const [estados, setEstados] = useState([]);
    const [loading, setLoading] = useState(true);

    // Carga de datos desde el backend
    useEffect(() => {
        let isMounted = true;
        
        const fetchEstados = async () => {
            try {
                const data = await listarEstados();
                if (isMounted) {
                    setEstados(data);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error al cargar selector de estados:", error);
                if (isMounted) setLoading(false);
            }
        };

        fetchEstados();
        return () => { isMounted = false; };
    }, []);

    // Mapeo de strings de la DB a objetos de FontAwesome
    const getIcon = (iconName) => {
        const iconMap = {
            'faClock': faClock,
            'faCircleCheck': faCircleCheck,
            'faBan': faBan,
            'faCheckDouble': faCheckDouble
        };
        return iconMap[iconName] || faExclamationTriangle;
    };

    return (
        <Grid item xs={12} md={3}>
            <FormControl 
                variant="outlined" 
                fullWidth 
                margin="normal" 
                error={turno.estadoid.error}
            >
                <InputLabel id="estado-selector-label">Estado</InputLabel>
                <Select
                    labelId="estado-selector-label"
                    id="estado-selector"
                    // Asegura que siempre tenga un valor para ser un componente controlado
                    value={turno.estadoid.dato || ''} 
                    label="Estado"
                    name="estadoid" // Crucial para el handleChange del padre
                    onChange={onChange}
                >
                    {loading ? (
                        <MenuItem disabled value="">
                            <Typography variant="body2">Cargando...</Typography>
                        </MenuItem>
                    ) : (
                        estados.map((est) => (
                            <MenuItem 
                                key={est.id} 
                                value={est.id} 
                                // Opcional: usar la clase CSS que viene de la base de datos
                                className={est.clase} 
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <FontAwesomeIcon 
                                        icon={getIcon(est.icono)} 
                                        style={{ color: est.color || 'inherit' }} 
                                    />
                                    <Typography variant="body1">
                                        {est.nombre}
                                    </Typography>
                                </Box>
                            </MenuItem>
                        ))
                    )}
                    
                    {!loading && estados.length === 0 && (
                        <MenuItem disabled value="">
                            No hay estados cargados en BD
                        </MenuItem>
                    )}
                </Select>
                
                {turno.estadoid.error && (
                    <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                        El estado es obligatorio
                    </Typography>
                )}
            </FormControl>
        </Grid>
    );
};