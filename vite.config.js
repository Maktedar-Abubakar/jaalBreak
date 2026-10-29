import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  // jsQR ships as CommonJS; pre-bundling lets `npm run dev` load it the same
  // way `npm run build` does. jsQR and pdf.js are only downloaded by the
  // browser when someone actually opens a QR image or a PDF.
  optimizeDeps: {
    include: ['jsqr'],
  },
  // pdf.js 4+ uses modern JavaScript (top-level await in its worker).
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
});
