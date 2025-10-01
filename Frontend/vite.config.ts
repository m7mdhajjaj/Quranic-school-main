import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // تحسينات الأداء
  build: {
    // تقليل حجم الحزم
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          // فصل المكتبات الكبيرة لتحسين التحميل
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'react-icons'],
          charts: ['chart.js', 'react-chartjs-2'],
          utils: ['axios', 'socket.io-client']
        }
      }
    },
    // ضغط أفضل
    minify: 'esbuild',
    // تحسين الـ sourcemaps
    sourcemap: false
  },
  
  // تحسين الخادم المحلي
  server: {
    port: 5173,
    hmr: {
      // تحسين Hot Module Replacement
      overlay: false
    },
    // تحسين استجابة الخادم
    fs: {
      strict: false
    },
    // إعداد البروكسي لتوجيه طلبات API إلى الباك اند
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  
  // تحسين حل الملفات
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  
  // تحسين معالجة CSS
  css: {
    devSourcemap: false
  }
});
