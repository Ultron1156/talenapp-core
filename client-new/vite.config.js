import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Bu satırı ekleyerek değişkeni kodun içine hapsediyoruz
  define: {
    'process.env': {}
  }
})