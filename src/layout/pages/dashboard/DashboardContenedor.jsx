import * as React from "react";
import { Outlet } from "react-router-dom";

const DashboardContenedor = () => {
    return (
        <>
            <Outlet />
        </>
    );
};

export default DashboardContenedor;
