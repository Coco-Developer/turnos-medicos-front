import React from 'react';
import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

const CambiarPasswordContenedor = () => {
    return (
        <Box sx={{ 
        
            backgroundColor: '#121212', 
            backgroundImage: 'radial-gradient(circle at center, #747474 0%, #a0e2c8 100%)',
            minHeight: '100vh', 
            width: '100%',
            display: 'flex',
            alignItems: 'center', // Centra verticalmente el contenido
            py: { xs: 2, md: 4 } 
        }}>
            <Container maxWidth="lg">
            
                <Outlet /> 
            </Container>
        </Box>
    );
};

export default CambiarPasswordContenedor;