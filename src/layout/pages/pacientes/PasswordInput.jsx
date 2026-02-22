import React, { useState } from "react";
import { FormControl, InputLabel, OutlinedInput, InputAdornment, FormHelperText } from "@mui/material";
import Grid from '@mui/material/Grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import {handleValidation} from "./FnGen";

export const PasswordInput = ({ paciente, setPaciente, onChange }) => {
    const [showPassword, setShowPassword] = useState(false);
    //--------------------------------------------------------------------------
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    //--------------------------------------------------------------------------
    const handleMouseDownPassword = (event) => event.preventDefault();
    //--------------------------------------------------------------------------
    const handleMouseUpPassword = (event) => event.preventDefault();
    //--------------------------------------------------------------------------

    //**************************************************************************
    //**************************************************************************
    //**************************************************************************
    return (
        <Grid size={{ xs: 12, md: 6 }}>
            <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel htmlFor="pw" error={paciente.password.error}>Contraseña</InputLabel>
                <OutlinedInput
                    id="pw"
                    name={paciente.password.campo}
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    required={paciente.password.requerido}
                    onChange={onChange}
                    onBlur={handleValidation(paciente, setPaciente)}
                    value={paciente.password.dato}
                    error={paciente.password.error}
                    endAdornment={
                        <InputAdornment position="end">
                            <FontAwesomeIcon
                                icon={showPassword ? faEyeSlash : faEye}
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                onMouseUp={handleMouseUpPassword}
                            />
                        </InputAdornment>
                    }
                />
                {paciente.password.error && (
                    <FormHelperText error>Debe ingresar una contraseña</FormHelperText>
                )}
            </FormControl>
        </Grid>
    );
};