import React from "react";
import Grid from '@mui/material/Grid';
import { Button, FormHelperText, Box } from "@mui/material";

export const FotoUploader = ({ medico, setMedico }) => {
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
            setMedico({
                ...medico,
                foto: {
                    ...medico.foto,
                    dato: base64String
                }
            });
        };
        reader.readAsDataURL(file);
    };

    return (
        <Grid
            size={{ xs: 12, md: 6 }}
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
            <Box
                mt={2}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '2px solid var(--mui-palette-primary-main)',
                    borderRadius: '50%',
                    padding: '0',
                    width: '200px',
                    height: '200px',
                }}
            >
                <img
                    src={
                        medico.foto?.dato
                            ? `data:image/jpeg;base64,${medico.foto.dato}`
                            : "/img/user.png"
                    }
                    alt="Vista previa"
                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius:'50%' }}
                />
            </Box>

            {medico.foto.error && (
                <FormHelperText error>Debe subir una imagen válida.</FormHelperText>
            )}

            <Button
                variant="outlined"
                size="small"
                component="label"
                sx={{ mt: 2,
                    width: {
                        xs: '100%',
                        sm: '100%',
                        md: '50%',
                    },
                }}
            >
                Subir Foto (JPG/PNG)
                <input
                    type="file"
                    accept="image/png, image/jpeg"
                    hidden
                    onChange={handleFileChange}
                />
            </Button>
        </Grid>
    );
};
