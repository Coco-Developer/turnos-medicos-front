import {crearEspecialidad, modificarEspecialidad} from "../../../services/especialidades.service";
import {useSnack} from "../../context/SnackContext";
//------------------------------------------------------------------------------
const validateForm = (especialidad, setEspecialidad) => {
    let allOK = true;
    for (const value of Object.values(especialidad)) {
        if (value.requerido && value.dato === '') {
            allOK = false;
            value.error = true;
        }
    }
    setEspecialidad(prev => ({
        ...prev,
        nombre: { ...prev.nombre, error: !allOK && prev.nombre.dato === '' }
    }));
    return allOK;
};
//------------------------------------------------------------------------------
export const SubmitForm = (especialidad, setEspecialidad, idEspecialidadMod, setSaving) => {
    const { setSnackData } = useSnack();
    return (event) => {
        event.preventDefault();
        const isValid = validateForm(especialidad, setEspecialidad);
        if (isValid) {
            setSaving(true);
            const espData = {nombre: especialidad.nombre.dato};
            if (idEspecialidadMod === 0) {
                crearEspecialidad(espData).then((r) => {
                    setSaving(false);
                    if (r.status === 200) {
                        setSnackData({
                            duration: 6000,
                            type: 'success',
                            message: 'Especialidad creada correctamente. Volviendo a Lista...',
                            open: true,
                            action: 'alta',
                            href: '/especialidades',
                        });
                    } else {
                        setSnackData({
                            type: 'error',
                            message: 'Error al crear la especialidad.',
                            open: true
                        });
                    }
                });
            } else {
                modificarEspecialidad(idEspecialidadMod, espData).then((r) => {
                    setSaving(false);
                    if (r.status === 200) {
                        setSnackData({
                            duration: 6000,
                            type: 'success',
                            message: 'Especialidad actualizada correctamente. Volviendo a Lista...',
                            open: true,
                            action: 'mod',
                            href: '/especialidades',
                        });
                    } else {
                        setSnackData({
                            type: 'error',
                            message: 'Error al actualizar la especialidad.',
                            open: true
                        });
                    }
                });
            }
        } else {
            setSnackData({
                type: 'error',
                message: 'Verifique los campos marcados en rojo.',
                open: true
            });
        }
    };
}