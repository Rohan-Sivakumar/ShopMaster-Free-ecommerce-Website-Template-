import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build optimizations
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code
          'react-vendor': ['react', 'react-dom'],
          'fontawesome': [
            '@fortawesome/fontawesome-svg-core',
            '@fortawesome/free-solid-svg-icons',
            '@fortawesome/react-fontawesome'
          ],
          'sweetalert': ['sweetalert2'],
        },
      },
    },
    
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Optimize CSS
    cssCodeSplit: true,
    
    // Source maps only for development
    sourcemap: false,
  },
  
  // Server optimizations for development
  server: {
    // Enable HTTP/2
    https: false,
    
    // Faster HMR
    hmr: {
      overlay: true,
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'sweetalert2'],
    exclude: [],
  },
  
  // Enable compression
  preview: {
    port: 4173,
  },
})
