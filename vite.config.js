import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Cambiamos '/src' por '@' que es el estándar
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Añadimos esto para asegurar que el build sea limpio
  build: {
    outDir: 'dist',
    sourcemap: false, // Menos peso en producción
  }
});