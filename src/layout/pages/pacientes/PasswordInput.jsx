import React, { useState, memo } from "react";
import { FormControl, InputLabel, OutlinedInput, InputAdornment, FormHelperText, Grid, IconButton } from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

/**
 * Recibe solo el valor 'password' (objeto con dato y error)
 * y las funciones necesarias.
 */
export const PasswordInput = memo(({ password, onChange, onBlur }) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    return (
        <Grid item xs={12} md={6}>
            <FormControl variant="outlined" fullWidth margin="normal" error={password.error}>
                <InputLabel htmlFor="pw">Contraseña</InputLabel>
                <OutlinedInput
                    id="pw"
                    name="password"
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    required={password.requerido}
                    onChange={onChange}
                    onBlur={onBlur} // La validación viene del padre ya procesada
                    value={password.dato}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                onClick={handleClickShowPassword}
                                onMouseDown={(e) => e.preventDefault()}
                                edge="end"
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </IconButton>
                        </InputAdornment>
                    }
                />
                {password.error && (
                    <FormHelperText>Debe ingresar una contraseña</FormHelperText>
                )}
            </FormControl>
        </Grid>
    );
});

PasswordInput.displayName = "PasswordInput";