import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  // Vite options tailored for Tauri development and optimized for old Macs
  
  // 1. Prevent vite from obscuring rust errors
  clearScreen: false,
  
  // 2. Tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. Tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
  
  // Optimizations for old hardware
  build: {
    // Reduce chunk size for better performance on old Macs
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['@tauri-apps/api']
        }
      }
    },
    // Disable minification terser for faster builds on old hardware
    minify: 'esbuild',
    // Reduce target for compatibility
    target: 'es2015'
  },
  
  // Reduce memory usage during development
  optimizeDeps: {
    include: ['@tauri-apps/api']
  }
}))