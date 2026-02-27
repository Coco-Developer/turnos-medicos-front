import React, { memo } from "react";
import { Button, FormHelperText, Box, Stack, Typography } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export const FotoUploader = memo(({ foto, setMedico }) => {
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            alert("Sólo se permiten archivos JPG, JPEG o PNG.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            setMedico((prev) => ({
                ...prev,
                foto: { ...prev.foto, dato: base64String, error: false }
            }));
        };
        reader.readAsDataURL(file);
        e.target.value = null;
    };

    const handleRemoveFoto = () => {
        setMedico((prev) => ({
            ...prev,
            foto: { ...prev.foto, dato: '', error: false }
        }));
    };

    return (
        /* Usamos Stack para forzar que cada elemento respete el espacio del anterior */
        <Stack 
            direction="column" 
            alignItems="center" 
            spacing={2} 
            sx={{ width: '100%', mb: 2 }}
        >
            <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
                Imagen de Perfil
            </Typography>

            {/* Contenedor Circular de la Foto */}
            <Box
                sx={{
                    position: 'relative',
                    width: 180,
                    height: 180,
                    border: '3px solid',
                    borderColor: 'primary.main',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    bgcolor: 'grey.100',
                    boxShadow: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <img
                    src={foto?.dato ? `data:image/jpeg;base64,${foto.dato}` : "/img/user.png"}
                    alt="Vista previa"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </Box>

            {/* Acciones de Foto */}
            <Stack direction="column" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                {foto?.dato && (
                    <Button
                        variant="text"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={handleRemoveFoto}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Eliminar foto actual
                    </Button>
                )}

                <Button
                    variant="contained" // Cambiado a contained para que destaque y no se pierda
                    size="medium"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ 
                        borderRadius: 2,
                        px: 4,
                        textTransform: 'none',
                        boxShadow: 1
                    }}
                >
                    {foto?.dato ? "Cambiar Foto" : "Subir Imagen"}
                    <input
                        type="file"
                        accept="image/png, image/jpeg"
                        hidden
                        onChange={handleFileChange}
                    />
                </Button>

                {foto.error && (
                    <FormHelperText error sx={{ fontWeight: 'bold' }}>
                        Debe subir una imagen válida.
                    </FormHelperText>
                )}
            </Stack>
        </Stack>
    );
});

FotoUploader.displayName = "FotoUploader";