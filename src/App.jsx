import './App.css';
import * as React from "react";
import {BrowserRouter, Navigate} from "react-router-dom";
import { SnackProvider } from "./layout/context/SnackContext";
import { AuthProvider } from "./layout/context/AuthContext";
import AppRoutes from "./layout/AppRoutes";

function App() {
    return (
        <AuthProvider> {/* El Auth suele envolver al resto */}
            <SnackProvider>
                <BrowserRouter>
                    <div className="App"> 
                        <AppRoutes />
                    </div>
                </BrowserRouter>
            </SnackProvider>
        </AuthProvider>
    );
}

export default App;