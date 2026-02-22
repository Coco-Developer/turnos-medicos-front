import "../../App.css";
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Divider, useTheme } from "@mui/material";
import { NavLink } from "react-router-dom";
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCalendar,
    faUser,
    faUserDoctor,
    faHeartPulse,
    faBars,
    faRightFromBracket,
    faCircleUser,
    faKey,
    faMoon,
    faSun,
    faChevronDown,
} from '@fortawesome/free-solid-svg-icons'
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";

/**
 * RUTAS ABSOLUTAS: 
 * Apuntan directamente a la carpeta /public. 
 * Ya no dependemos de imports que rompan el servidor de Vite.
 */
const logoLight = '/logo.png';
const logoDark = '/logo-dark.png';

const pages = ['turnos', 'pacientes', 'medicos', 'especialidades'];
const pagesIcons = [faCalendar, faUser, faUserDoctor, faHeartPulse];

function CustomToolbar() {
    const { user, logout } = useAuth();
    const theme = useTheme();
    const { mode, toggleTheme } = useThemeMode();
    const [toggled, setToggled] = React.useState(false);
    const [showMenu, setShowMenu] = React.useState(false);
    const [showSubMenu, setShowSubMenu] = React.useState(false);

    return (
        <>
            <Sidebar 
                breakPoint="sm"
                onBackdropClick={() => setToggled(false)} 
                toggled={toggled} 
                onBreakPoint={setShowMenu}
                dataTgTour="Barra de menú"
            >
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <NavLink to={'dashboard'} className="app-logo" style={{ textDecoration: 'none', textAlign: 'center' }}>
                        {/* Selector de logo basado en el tema con ruta absoluta */}
                        <img 
                            src={mode === "dark" ? logoDark : logoLight} 
                            style={{ height: "4.5rem", width: "auto", marginBottom: "0.5rem"}} 
                            alt="ChronoMed Logo" 
                        />
                        <Typography
                            variant="h5"
                            noWrap
                            component="div"
                            sx={{ color: theme.palette.primary.contrastText, letterSpacing: 1 }}
                        >
                            Chrono<b style={{ fontWeight: 800 }}>Med</b>
                        </Typography>
                    </NavLink>
                </Box>

                <Divider sx={{ mb: 1, opacity: 0.3 }} />

                <Menu
                    menuItemStyles={{
                        button: ({ active, disabled }) => ({
                            color: disabled ? theme.palette.primary.light : theme.palette.primary.contrastText,
                            backgroundColor: active ? theme.palette.secondary.dark : 'transparent',
                            textTransform: "uppercase",
                            fontSize: ".85rem",
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            },
                        }),
                    }}
                >
                    {pages.map((page, ndx) => (
                        <MenuItem
                            key={page}
                            component={<NavLink to={page} />}
                            icon={<FontAwesomeIcon icon={pagesIcons[ndx]} size="lg" />}
                        >
                            {page}
                        </MenuItem>
                    ))}

                    <Divider sx={{ my: 1, bgcolor: "primary.light", opacity: 0.2 }} variant="middle" />

                    {/* Menú de Usuario */}
                    <Box
                        sx={{
                            px: 3,
                            py: 1.5,
                            color: "var(--mui-palette-on-sidebar-background)",
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: "pointer",
                            fontSize: ".85rem",
                            textTransform: "uppercase"
                        }}
                        onClick={() => setShowSubMenu((prev) => !prev)}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FontAwesomeIcon icon={faCircleUser} />
                            <span>{user?.nombre || "Usuario"}</span>
                        </Box>
                        <FontAwesomeIcon
                            icon={faChevronDown}
                            style={{ 
                                transition: 'transform 0.3s',
                                transform: showSubMenu ? 'rotate(180deg)' : 'rotate(0deg)' 
                            }}
                        />
                    </Box>

                    {showSubMenu && (
                        <Box sx={{ bgcolor: 'rgba(0,0,0,0.1)', pb: 1 }}>
                            <MenuItem
                                key="cambiarpass"
                                component={<NavLink to="/cambiarpass" />}
                                icon={<FontAwesomeIcon icon={faKey} size="sm" />}
                            >
                                Contraseña
                            </MenuItem>

                            <MenuItem
                                onClick={toggleTheme}
                                icon={<FontAwesomeIcon icon={mode === "dark" ? faSun : faMoon} size="sm" />}
                            >
                                {mode === "dark" ? "Modo Claro" : "Modo Oscuro"}
                            </MenuItem>

                            <MenuItem
                                icon={<FontAwesomeIcon icon={faRightFromBracket} size="sm" />}
                                onClick={logout}
                                sx={{ color: '#ff8a80' }}
                            >
                                Salir
                            </MenuItem>
                        </Box>
                    )}
                </Menu>
            </Sidebar>

            {showMenu && (
                <NavLink className="sb-button" onClick={() => setToggled(!toggled)} style={{ position: 'fixed', top: 15, left: 15, zIndex: 1000 }}>
                    <FontAwesomeIcon icon={faBars} size="lg" />
                </NavLink>
            )}
        </>
    );
}

export default CustomToolbar;