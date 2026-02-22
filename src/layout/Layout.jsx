import '../App.css';
import { Outlet } from 'react-router-dom';
import CustomToolbar from './toolbar/CustomToolbar';
import Box from '@mui/material/Box';

const Layout = () => {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        
            <CustomToolbar /> 

            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    p: 3, 
                    width: '100%',
                    backgroundColor: 'background.default',
                    minHeight: '100vh',
                    overflowX: 'hidden' 
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;