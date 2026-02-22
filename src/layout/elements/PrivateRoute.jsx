import { Navigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import {LoadingWidget} from "./Widgets";

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return <LoadingWidget />
    }
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;