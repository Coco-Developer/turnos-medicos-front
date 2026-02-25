import { crearPaciente, modificarPaciente, obtenerPacientePorDNI } from "../../../services/pacientes.service";
import { useSnack } from "../../context/SnackContext";
import dayjs from "dayjs";

// Maneja la validación en tiempo real de cada input
export const handleValidation = (paciente, setPaciente) => (e) => {
    const isValid = !(e.target.value === '');
    const pac = { ...paciente[e.target.name], error: !isValid };
    setPaciente({ ...paciente, [e.target.name]: pac });
    return isValid;
};

// Valida todo el formulario antes de enviar
const validateForm = (paciente, setPaciente) => {
    let allOK = true;
    const nuevosDatos = { ...paciente };

    for (const [key, value] of Object.entries(paciente)) {
        if (value.requerido) {
            const isNotValid = (value.dato === '' || value.dato == null);
            if (isNotValid) {
                allOK = false;
                nuevosDatos[key] = { ...value, error: true };
            }
        }
    }
    
    // Actualizamos el estado una sola vez con todos los errores encontrados
    if (!allOK) setPaciente(nuevosDatos);
    return allOK;
}

export const SubmitForm = (paciente, setPaciente, idPacienteMod, setSaving) => {
    const { setSnackData } = useSnack();
    
    return async (event) => { // Usamos async/await para que sea más legible que los .then()
        event.preventDefault();
        
        if (!validateForm(paciente, setPaciente)) {
            setSnackData({ type: 'error', message: 'Verifique los campos obligatorios.', open: true });
            return;
        }

        setSaving(true);
        
        // --- PREPARACIÓN DEL DTO PARA C# ---
        let pacDto = {};
        for (const [key, value] of Object.entries(paciente)) {
            const keyUpper = key.charAt(0).toUpperCase() + key.slice(1);
            
            if (key.toLowerCase() === 'fechanacimiento') {
                // Si la fecha es inválida o nula, mandamos null, sino el formato ISO
                pacDto[keyUpper] = value.dato ? dayjs(value.dato).format('YYYY-MM-DD') : null;
            } else {
                pacDto[keyUpper] = value.dato;
            }
        }

        try {
            if (idPacienteMod === 0) {
                // 1. Verificar DNI
                const resDni = await obtenerPacientePorDNI(pacDto.Dni);
                
                // Si r.status es undefined o 200, significa que encontró un paciente (DNI ocupado)
                if (resDni && (resDni.status === 200 || resDni.id)) {
                    setSnackData({ 
                        type: 'error', 
                        message: `El DNI ${pacDto.Dni} ya está registrado.`, 
                        open: true 
                    });
                    setSaving(false);
                    return;
                }

                // 2. Crear Paciente
                const resCreate = await crearPaciente(pacDto);
                if (resCreate.status === 200 || resCreate.status === 201) {
                    setSnackData({
                        type: 'success',
                        message: '¡Paciente guardado con éxito!',
                        open: true,
                        href: "/pacientes"
                    });
                } else {
                    // Si el backend mandó un error (ej: 400), mostramos el mensaje que viene del back
                    const msg = resCreate.data?.message || 'Error al guardar el paciente.';
                    setSnackData({ type: 'error', message: msg, open: true });
                }
            } else {
                // 3. Modificar Paciente
                const resUpdate = await modificarPaciente(idPacienteMod, pacDto);
                if (resUpdate.status === 200) {
                    setSnackData({
                        type: 'success',
                        message: 'Datos actualizados correctamente.',
                        open: true,
                        href: "/pacientes"
                    });
                } else {
                    setSnackData({ type: 'error', message: 'Error al actualizar.', open: true });
                }
            }
        } catch (error) {
            console.error("Error en SubmitForm:", error);
            setSnackData({ type: 'error', message: 'Error de conexión con el servidor.', open: true });
        } finally {
            setSaving(false);
        }
    };
}