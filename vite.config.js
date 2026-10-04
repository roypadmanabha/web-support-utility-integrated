import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/web-support-utility-integrated/',
  plugins: [react()],
  server: {
    port: 5174,
    host: true
  }
})
