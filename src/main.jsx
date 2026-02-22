import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. Primero los estilos globales
import './App.css'; 
// 2. Luego el contexto y la App
import App from './App';
import { ThemeModeProvider } from "./layout/context/ThemeContext";

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeModeProvider>
            <App />
        </ThemeModeProvider>
    </React.StrictMode>
);