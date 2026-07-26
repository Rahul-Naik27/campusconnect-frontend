import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Redux state management
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          // Heavy chart library
          'vendor-recharts': ['recharts'],
          // Animation library
          'vendor-framer': ['framer-motion'],
          // QR + canvas (only needed on ticket/event pages)
          'vendor-utils': ['html2canvas', 'qrcode', 'html5-qrcode'],
        },
      },
    },
    // Raise warning threshold to avoid noise
    chunkSizeWarningLimit: 600,
  },
})

