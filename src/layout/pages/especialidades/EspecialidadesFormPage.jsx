import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { Paper } from "@mui/material";
import Grid from '@mui/material/Grid';
import { obtenerEspecialidad } from "../../../services/especialidades.service";
import {NombreEspecialidadInput} from "./NombreEspecialidadInput";
import {FormActions} from "../../elements/FormActions";
import {SubmitForm} from "./FnGen";
//==============================================================================
const EspecialidadesFormPage = () => {
    const { id } = useParams();
    const idEspecialidadMod = id === undefined ? 0 : id;
    const [saving, setSaving] = useState(false);

    const datosIniciales = useMemo(() => ({
        nombre: {
            campo: 'nombre',
            rotulo: 'Nombre de la Especialidad',
            dato: '',
            requerido: true,
            error: false
        },
    }), []);

    const [especialidad, setEspecialidad] = useState(datosIniciales);

    const cargarEspecialidad = (id) => {
        if (id !== 0) {
            obtenerEspecialidad(id).then((r) => {
                const dat = {
                    nombre: {
                        dato: r.nombre,
                        campo: 'nombre',
                        rotulo: 'Nombre de la Especialidad',
                        requerido: true,
                        error: false
                    }
                };
                setEspecialidad(dat);
            });
        }
    };

    useEffect(() => {
        cargarEspecialidad(idEspecialidadMod);
    }, [idEspecialidadMod]);

    //--------------------------------------------------------------------------
    //------------------------------HANDLERS------------------------------------
    //--------------------------------------------------------------------------
    const handleSubmit = SubmitForm(especialidad, setEspecialidad, idEspecialidadMod, setSaving);
    //--------------------------------------------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedField = { ...especialidad[name], dato: value, error: false };
        setEspecialidad(prev => ({ ...prev, [name]: updatedField }));
    };

    //**************************************************************************
    //**************************************************************************
    //**************************************************************************
    return (
        <>
            <Typography variant="h1" className="page-title" color="primary">
                Especialidades - {idEspecialidadMod === 0 ? "Alta" : "Modificación"}
            </Typography>
            <Paper elevation={0} sx={{ backgroundColor: 'transparent', my: 1, mx: 'auto', p: 2 }}>
                <form onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={2}>
                        <NombreEspecialidadInput
                            especialidad={especialidad}
                            setEspecialidad={setEspecialidad}
                            onChange={handleChange}
                        />
                        <FormActions
                            onSubmit={handleSubmit}
                            loading={saving}
                        />
                    </Grid>
                </form>
            </Paper>
        </>
    );
};

export default EspecialidadesFormPage;