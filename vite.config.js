import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Em desenvolvimento, /api é repassado para a API local (server/, porta 3333).
// Em produção, defina VITE_API_URL com a URL pública da API (ex.: https://kultiva-api.onrender.com).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3333',
    },
  },
})
