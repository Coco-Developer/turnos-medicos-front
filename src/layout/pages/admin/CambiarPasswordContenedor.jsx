import React from 'react';
import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

const CambiarPasswordContenedor = () => {
    return (
        <Box sx={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            py: { xs: 2, md: 4 },
            background:
                'linear-gradient(180deg, rgba(0,124,106,0.08) 0%, rgba(0,62,134,0.04) 100%)'
        }}>
            <Container maxWidth="md">
                <Outlet />
            </Container>
        </Box>
    );
};

export default CambiarPasswordContenedor;
