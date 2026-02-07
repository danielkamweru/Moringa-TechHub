import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173, // Use port 5173 as configured in CORS
    host: '0.0.0.0',
    open: true
  },
  build: {
    assetsDir: 'assets',
    sourcemap: true
  }
})