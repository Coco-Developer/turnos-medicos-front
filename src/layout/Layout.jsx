import '../App.css';
import { Outlet } from 'react-router-dom';
import CustomToolbar from './toolbar/CustomToolbar';
import Box from '@mui/material/Box';

const Layout = () => {
    return (
        <Box sx={{ display: 'flex', minHeight: '100dvh', width: '100%' }}>
        
            <CustomToolbar /> 

            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    p: { xs: 1.25, sm: 2, md: 3 }, 
                    width: '100%',
                    backgroundColor: 'background.default',
                    minHeight: '100dvh',
                    overflowX: 'hidden',
                    overflowY: 'auto'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
