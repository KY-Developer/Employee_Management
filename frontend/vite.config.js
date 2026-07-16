import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4da6ff',
          DEFAULT: '#0b84ff',
          dark: '#0066cc',
        },
        secondary: {
          light: '#f39e58',
          DEFAULT: '#ed8936',
          dark: '#dd6b20',
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
})
