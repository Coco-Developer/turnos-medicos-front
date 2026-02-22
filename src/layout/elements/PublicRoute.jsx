import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {LoadingWidget} from "./Widgets";

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return <LoadingWidget />
    }
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export default PublicRoute;