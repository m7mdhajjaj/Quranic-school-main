import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from 'vite';
import path from 'path';

// Plugin to serve service worker with correct MIME type
const serviceWorkerPlugin = (): Plugin => ({
  name: 'service-worker-mime',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/firebase-messaging-sw.js') {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Service-Worker-Allowed', '/');
      }
      next();
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), serviceWorkerPlugin()],
  
  // تحسينات الأداء
  build: {
    // تقليل حجم الحزم
    chunkSizeWarningLimit: 500, // تقليل الحد الأقصى لحجم الـ chunk
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // فصل المكتبات الكبيرة لتحسين التحميل بشكل ديناميكي
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }
            if (id.includes('react-icons')) {
              return 'react-icons';
            }
            if (id.includes('chart.js') || id.includes('react-chartjs')) {
              return 'charts';
            }
            if (id.includes('axios') || id.includes('socket.io')) {
              return 'api-vendor';
            }
            if (id.includes('aos')) {
              return 'animations';
            }
            // باقي المكتبات في vendor عام
            return 'vendor';
          }
          // فصل صفحات QuranAudio في chunk منفصل
          if (id.includes('/pages/QuranAudio/')) {
            return 'quran-audio';
          }
          // فصل صفحات QuranPage في chunk منفصل
          if (id.includes('/pages/QuranPage/')) {
            return 'quran-page';
          }
          // فصل المكونات المشتركة
          if (id.includes('/components/shared/')) {
            return 'shared-components';
          }
        },
      },
    },
    // ضغط أفضل باستخدام terser بدلاً من esbuild
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // إزالة console.log في الإنتاج
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // إزالة وظائف معينة
      },
      mangle: {
        safari10: true, // دعم Safari 10
      },
    },
    // تحسين الـ sourcemaps
    sourcemap: false,
    // تقسيم CSS إلى ملفات منفصلة
    cssCodeSplit: true,
    // تحسين حجم الأصول
    assetsInlineLimit: 4096, // 4kb - تضمين الملفات الصغيرة كـ base64
  },
  
  // تحسين الخادم المحلي
  server: {
    port: 5173,
    host: 'localhost',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      overlay: false
    },
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
    },
    headers: {
      // Set proper MIME type for service worker
      'Service-Worker-Allowed': '/',
    }
  },
  
  // Public directory configuration
  publicDir: 'public',
  
  // تحسين حل الملفات
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  
  // تحسين معالجة CSS
  css: {
    devSourcemap: false
  },
  
  // تحسين dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'lucide-react'
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
});
