import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Build optimizations
  build: {
    // Target modern browsers for smaller bundle
    target: 'es2020',

    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug']
      }
    },

    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'vendor-ui': ['@headlessui/react', '@heroicons/react', 'lucide-react'],
          // Calendar (large dependency)
          'vendor-calendar': ['@fullcalendar/core', '@fullcalendar/react', '@fullcalendar/daygrid', '@fullcalendar/timegrid', '@fullcalendar/interaction'],
          // Charts
          'vendor-charts': ['recharts'],
          // Forms
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'yup']
        }
      }
    },

    // Generate source maps for debugging (disable in production if needed)
    sourcemap: false,

    // Chunk size warnings
    chunkSizeWarningLimit: 500
  },

  // Dev server optimizations
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: true
    }
  },

  // Preview server (for testing production build)
  preview: {
    port: 4173,
    strictPort: true
  }
})
