import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// cấu hình cho frontend ClickLộc
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
