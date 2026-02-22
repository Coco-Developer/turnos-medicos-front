
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import DashboardContenedor from "./pages/dashboard/DashboardContenedor";
import DashboardPage from "./pages/dashboard/Dashboard";
import PacientesContenedor from "./pages/pacientes/PacientesContenedor";
import PacientesListPage from "./pages/pacientes/PacientesListPage";
import PacienteFormPage from "./pages/pacientes/PacientesFormPage";
import PacienteTurnosPage from "./pages/pacientes/PacienteTurnosPage";
import MedicosContenedor from "./pages/medicos/MedicosContenedor";
import MedicosListPage from "./pages/medicos/MedicosListPage";
import MedicoFormPage from "./pages/medicos/MedicosFormPage";
import TurnosContenedor from "./pages/turnos/TurnosContenedor";
import TurnosListPage from "./pages/turnos/TurnosListPage";
import TurnosFormPage from "./pages/turnos/TurnosFormPage";
import EspecialidadesContenedor from "./pages/especialidades/EspecialidadesContenedor";
import EspecialidadesListPage from "./pages/especialidades/EspecialidadesListPage";
import EspecialidadFormPage from "./pages/especialidades/EspecialidadesFormPage";
import LoginPage from "./pages/login/LoginPage";
import ForgotPassword from "./pages/login/ForgotPassword";
import PrivateRoute from './elements/PrivateRoute';
import PublicRoute from "./elements/PublicRoute";
import CambiarPasswordContenedor from "./pages/admin/CambiarPasswordContenedor";
import CambiarPasswordPage from "./pages/admin/CambiarPassword";

const AppRoutes = ({ setTokenLoaded }) => {
    return (
        <Routes>
            <Route path="/login" element={
                <PublicRoute>
                    <LoginPage setTokenLoaded={setTokenLoaded} />
                </PublicRoute>
            } />
            <Route path="/recuperar" element={
                <PublicRoute>
                    <ForgotPassword />
                </PublicRoute>
            } />

            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route path="/dashboard" element={<DashboardContenedor />}>
                    <Route index element={<DashboardPage />} />
                </Route>

                <Route path="/cambiarpass" element={<CambiarPasswordContenedor />} >
                    <Route index element={<CambiarPasswordPage />} />
                </Route>

                {/* Rutas para Turnos */}
                <Route path="/turnos" element={<TurnosContenedor />}>
                    <Route index element={<TurnosListPage />} />
                    <Route path="lista" element={<TurnosListPage />} />
                    <Route path="form" element={<TurnosFormPage />} />
                    <Route path="form/:id" element={<TurnosFormPage />} />
                </Route>

                {/* Rutas para Pacientes */}
                <Route path="/pacientes" element={<PacientesContenedor />}>
                    <Route index element={<PacientesListPage />} />
                    <Route path="lista" element={<PacientesListPage />} />
                    <Route path="turnos/:id" element={<PacienteTurnosPage />} />
                    <Route path="form" element={<PacienteFormPage />} />
                    <Route path="form/:id" element={<PacienteFormPage />} />
                    <Route path="" element={<Navigate to="/pacientes/lista" />} />
                </Route>

                {/* Rutas para Médicos */}
                <Route path="/medicos" element={<MedicosContenedor />}>
                    <Route index element={<MedicosListPage />} />
                    <Route path="lista" element={<MedicosListPage />} />
                    <Route path="form" element={<MedicoFormPage />} />
                    <Route path="form/:id" element={<MedicoFormPage />} />
                </Route>

                {/* Rutas para Especialidades */}
                <Route path="/especialidades" element={<EspecialidadesContenedor />}>
                    <Route index element={<EspecialidadesListPage />} />
                    <Route path="lista" element={<EspecialidadesListPage />} />
                    <Route path="form" element={<EspecialidadFormPage />} />
                    <Route path="form/:id" element={<EspecialidadFormPage />} />
                </Route>

                {/* Ruta principal de redirección */}
                <Route index element={<Navigate to="dashboard" />} />
            </Route>

            {/* Ruta para páginas no encontradas */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
}

export default AppRoutes;