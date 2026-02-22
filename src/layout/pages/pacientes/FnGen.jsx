import {crearPaciente, modificarPaciente, obtenerPacientePorDNI} from "../../../services/pacientes.service";
import {useSnack} from "../../context/SnackContext";
//------------------------------------------------------------------------------
export const handleValidation = (paciente, setPaciente) => (e) => {
    const isValid = !(e.target.value === '');
    const pac = { ...paciente[e.target.name], ...{ error: !isValid } };
    setPaciente({ ...paciente, [e.target.name]: pac });
    return isValid;
};
//------------------------------------------------------------------------------
const validateForm = (paciente, setPaciente) => {
    //console.info('ValidForm');
    // Validar TODOS los campos de una sola vez.
    let allOK = true; // Se asumen todos los campos OK.
    let isNotValid = false;

    for (const [key, value] of Object.entries(paciente)) {
        if (value.requerido) {
            isNotValid = (value.dato === '' || value.dato == null); // Verdadero si vacío o nulo

            // La fecha es un caso MUY especial.
            if (key === 'fechanacimiento' && value.dato == null) {
                // Se asigna un valor completamente inválido para que se
                // marque en rojo (ya que ni el null ni el vacío lo hacen).
                value.dato = 'a';
            }

            if (isNotValid) {
                // allOK es verdadero si TODOS los campos son válidos.
                allOK = allOK && !isNotValid;

                value.error = isNotValid;
                setPaciente({
                    ...paciente,
                    [key]: value
                });
            }
        }
    }
    return allOK;
}
//------------------------------------------------------------------------------
export const SubmitForm = (paciente, setPaciente, idPacienteMod, setSaving) => {
    const { setSnackData } = useSnack();
    return (event) => {
        //console.info('handleSubmit');
        event.preventDefault()

        const isValid = validateForm(paciente, setPaciente);

        let pac = {};

        if (isValid) {
            setSaving(true);
            // Preparar el objeto con los datos a guardar.
            for (const [key, value] of Object.entries(paciente)) {
                pac = {...pac, [key]: value.dato}
            }
            delete pac.pac; // Se borra la prop extra.
            console.info('Inicio');

            if (idPacienteMod === 0) {
                // Verificar si el DNI ya existe antes de crear.
                obtenerPacientePorDNI(pac.dni).then((r) => {
                    if (r.status === undefined) {
                        // Ya existe un Paciente con ese DNI.
                        setSaving(false);
                        setSnackData({
                            type: 'error',
                            message: `Ya existe un Paciente con ese DNI (${pac.dni}).`,
                            open: true
                        });
                    }
                    else{
                        // No existe DNI, se puede crear.
                        crearPaciente(pac).then((r) => {
                            setSaving(false);
                            if (r.status === 200) {
                                setSnackData({
                                    duration: 8000,
                                    type: 'success',
                                    message: 'Guardado correctamente. Volviendo a Lista...',
                                    open: true,
                                    action: 'alta',
                                    href: "/pacientes"
                                });
                            } else {
                                const errorText = r.statusText ?? 'Hubo un error al guardar. Vuelva a intentarlo.';

                                setSnackData({
                                    type: 'error',
                                    message: errorText,
                                    open: true,
                                    action: ''
                                });
                            }
                        });
                    }
                });
            } else {
                modificarPaciente(idPacienteMod, pac).then((r) => {
                    setSaving(false);
                    if (r.status === 200) {
                        setSnackData({
                            duration: 6000,
                            type: 'success',
                            message: 'Actualizado correctamente. Volviendo a Lista...',
                            open: true,
                            action: 'mod',
                            href: "/pacientes"
                        });
                    } else {
                        const errorText = r.statusText ?? 'Hubo un error al actualizar. Vuelva a intentarlo.';

                        setSnackData({
                            type: 'error',
                            message: errorText,
                            open: true
                        })
                    }
                });
            }

        } else {
            setSnackData({
                type: 'error',
                message: 'Verifique los campos marcados en rojo.',
                open: true
            })
        }

    };
}