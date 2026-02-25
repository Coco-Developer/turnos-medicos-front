import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Mantenemos tu estándar de alias con '@'
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Azure Static Web Apps buscará esta carpeta
    outDir: 'dist', 
    // Limpia la carpeta antes de construir para evitar archivos basura
    emptyOutDir: true,
    // Optimización para producción
    sourcemap: false, 
    // Divide el código en trozos más pequeños para que cargue más rápido
    chunkSizeWarningLimit: 1000,
  },
  // Esto asegura que las variables VITE_ se carguen correctamente
  envPrefix: 'VITE_',
});