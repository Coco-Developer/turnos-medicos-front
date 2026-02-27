import dayjs from "dayjs";
import { crearPaciente, modificarPaciente, obtenerPacientePorDNI } from "../../../services/pacientes.service";

/**
 * Valida un campo individual (utilizado en onBlur para feedback inmediato)
 */
export const handleValidation = (paciente, setPaciente, e) => {
    const { name, value } = e.target;
    const field = paciente[name];
    if (!field) return;

    let isValid = true;

    // Validación de requeridos
    if (field.requerido && value.trim() === '') {
        isValid = false;
    }

    // Validación específica de formato de Email
    if (name === 'email' && value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
        }
    }

    setPaciente(prev => ({
        ...prev,
        [name]: { ...prev[name], error: !isValid }
    }));
};

/**
 * Valida todo el formulario antes del submit
 */
const validateForm = (paciente, setPaciente) => {
    let allOK = true;
    const nuevosDatos = { ...paciente };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const [key, value] of Object.entries(paciente)) {
        let errorEnCampo = false;

        // 1. Validar requeridos
        if (value.requerido) {
            const isInvalid = !value.dato || (typeof value.dato === 'string' && value.dato.trim() === '');
            if (isInvalid) errorEnCampo = true;
        }

        // 2. Validar formato de email específicamente
        if (key === 'email' && value.dato) {
            if (!emailRegex.test(value.dato)) errorEnCampo = true;
        }

        if (errorEnCampo) {
            allOK = false;
            nuevosDatos[key] = { ...value, error: true };
        }
    }
    
    if (!allOK) setPaciente(nuevosDatos);
    return allOK;
};

/**
 * Función principal de envío de formulario
 */
export const SubmitForm = (paciente, setPaciente, idPacienteMod, setSaving, setSnackData, navigate) => {
    return async (event) => {
        event.preventDefault();

        // 1. Validar campos
        if (!validateForm(paciente, setPaciente)) {
            setSnackData({ 
                type: 'error', 
                message: 'Verifique los campos obligatorios o el formato del email.', 
                open: true 
            });
            return;
        }

        setSaving(true);

        // 2. Preparar DTO para el Backend (C# utiliza PascalCase)
        let pacDto = {};
        Object.entries(paciente).forEach(([key, value]) => {
            // Capitalizar la primera letra (nombre -> Nombre)
            const keyUpper = key.charAt(0).toUpperCase() + key.slice(1);
            
            if (key.toLowerCase() === 'fechanacimiento') {
                pacDto[keyUpper] = value.dato ? dayjs(value.dato).format('YYYY-MM-DD') : null;
            } else {
                pacDto[keyUpper] = value.dato;
            }
        });

        try {
            let res;
            if (idPacienteMod === 0) {
                // Verificar DNI duplicado antes de Crear
                try {
                    const resDni = await obtenerPacientePorDNI(pacDto.Dni);
                    if (resDni && (resDni.status === 200 || resDni.id)) {
                        setSnackData({ 
                            type: 'error', 
                            message: `El DNI ${pacDto.Dni} ya está registrado en el sistema.`, 
                            open: true 
                        });
                        setSaving(false);
                        return;
                    }
                } catch (e) {
                    // Si el error es 404 (No encontrado), el DNI está disponible, continuamos.
                    if (e.response?.status !== 404) console.warn("DNI check bypass o error menor");
                }

                res = await crearPaciente(pacDto);
            } else {
                // Modificar existente
                res = await modificarPaciente(idPacienteMod, pacDto);
            }

            // 3. Manejar Respuesta Exitosa
            if (res.status === 200 || res.status === 201) {
                setSnackData({
                    type: 'success',
                    message: idPacienteMod === 0 
                        ? '¡Paciente creado! Redireccionando a la lista...' 
                        : '¡Cambios guardados! Volviendo a la lista...',
                    open: true
                });
                
                // Redirección con delay para lectura del usuario
                setTimeout(() => {
                    navigate("/pacientes");
                }, 1800);
            } else {
                const errorMsg = res.data?.message || 'Error en la operación del servidor.';
                setSnackData({ type: 'error', message: errorMsg, open: true });
                setSaving(false);
            }
        } catch (error) {
            console.error("Error en Submit:", error);
            setSnackData({ 
                type: 'error', 
                message: 'No se pudo conectar con el servidor. Intente más tarde.', 
                open: true 
            });
            setSaving(false);
        }
    };
};