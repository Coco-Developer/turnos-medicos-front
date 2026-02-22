import React, {useEffect, useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import Typography from "@mui/material/Typography";
import Grid from '@mui/material/Grid';
import {obtenerPaciente} from "../../../services/pacientes.service";
import {PersonalInfoInputs} from "./PersonalInfoInputs";
import {ContactInfoInputs} from "./ContactInfoInputs";
import {IdentificationInput} from "./IdentificationInput";
import {PasswordInput} from "./PasswordInput";
import {BirthDatePicker} from "./BirthDatePicker";
import {Paper} from "@mui/material";
import {getOnlyLettersEs, getOnlyNumbers} from "../../libs/Utils";
import {FormActions} from "../../elements/FormActions";
import {SubmitForm} from "./FnGen";
//==============================================================================
const PacientesFormPage = () => {
    const { id } = useParams();
    const idPacienteMod = id === undefined ? 0 : id;
    const [saving, setSaving] = useState(false);

    //--------------------------------------------------------------------------
    // Idea para preservar el estado inicial obtenido de:
    // https://stackoverflow.com/a/54896006

    // Referencia de las propiedades de los objetos:
    // campo: Nombre del campo en la API. HARDCODED
    // dato: Acá se almacena el dato en sí. VARIABLE
    // requerido: Si validar o no por vacío. HARDCODED
    // error: Si mostrar o no un error. VARIABLE
    const datosIniciales = useMemo(
        () => { return {
            apellido: {
                campo: 'apellido',
                rotulo: 'Apellido',
                dato: '',
                requerido: true,
                error: false
            },
            nombre: {
                campo: 'nombre',
                dato: '',
                requerido: true,
                error: false
            },
            telefono: {
                campo: 'telefono',
                dato: '',
                requerido: true,
                error: false
            },
            email: {
                campo: 'email',
                dato: '',
                requerido: true, /* ¿OPCIONAL? */
                error: false
            },
            dni: {
                campo: 'dni',
                dato: '',
                requerido: true,
                error: false
            },
            password: {
                campo: 'password',
                dato: '',
                requerido: true,
                error: false
            },
            fechanacimiento: {
                campo: 'fechanacimiento',
                dato: null,
                requerido: true,
                error: false
            },

        }},
        [],
    );
    //--------------------------------------------------------------------------
    const [paciente, setPaciente] = useState(datosIniciales);
    //--------------------------------------------------------------------------
    const cargarPaciente = (id) => {
        if (id !== 0) {
            obtenerPaciente(id).then((r) => {
                let pac = datosIniciales;
                const dat = {
                    apellido: {
                        dato: r.apellido
                    },
                    nombre: {
                        dato: r.nombre
                    },
                    telefono: {
                        dato: r.telefono
                    },
                    email: {
                        dato: r.email
                    },
                    dni: {
                        dato: r.dni
                    },
                    password: {
                        dato: r.password,
                        requerido: false // Para poder guardar sin enviar la contraseña
                    },
                    fechanacimiento: {
                        dato: r.fechaNacimiento
                    }
                };
                for (const key of Object.keys(pac)) {
                    pac[key] = { ...pac[key], ...dat[key] };
                }
                setPaciente({ ...paciente, pac });
            });
        }
    };
    //--------------------------------------------------------------------------
    useEffect(() => {
        cargarPaciente(idPacienteMod);
    }, [idPacienteMod]);
    //--------------------------------------------------------------------------
    //------------------------------HANDLERS------------------------------------
    //--------------------------------------------------------------------------
    const handleSubmit = SubmitForm(paciente, setPaciente, idPacienteMod, setSaving);
    //--------------------------------------------------------------------------
    const handleChange = (e) => {
        //console.info('handleChange');

        if (e.target.name === 'telefono' || e.target.name === 'dni'){
            // Dejar solo los números
            e.target.value = getOnlyNumbers(e.target.value);
        }

        if (e.target.name === 'nombre' || e.target.name === 'apellido' ){
            // Solo letras, acentos, eñes, diéresis y espacio
            e.target.value = getOnlyLettersEs(e.target.value);
        }

        const pac = {...paciente[e.target.name], ...{dato: e.target.value}};

        setPaciente({
            ...paciente,
            [e.target.name]: pac
        });
    };

    //**************************************************************************
    //**************************************************************************
    //**************************************************************************
    return (
        <>
            <Typography variant="h1" className="page-title" color="primary">
                Pacientes - {idPacienteMod === 0 ? "Alta" : "Modificación"}
            </Typography>
            <Paper elevation={0} sx={{ backgroundColor: 'transparent', my: 1, mx: 'auto', p: 2 }}>
                <form onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={2}>
                        <PersonalInfoInputs
                            paciente={paciente}
                            setPaciente={setPaciente}
                            onChange={handleChange}
                        />
                        <ContactInfoInputs
                            paciente={paciente}
                            setPaciente={setPaciente}
                            onChange={handleChange}
                        />
                        <IdentificationInput
                            paciente={paciente}
                            setPaciente={setPaciente}
                            onChange={handleChange}
                        />
                        <PasswordInput
                            paciente={paciente}
                            setPaciente={setPaciente}
                            onChange={handleChange}
                        />
                        <BirthDatePicker
                            paciente={paciente}
                            setPaciente={setPaciente}
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

export default PacientesFormPage;