import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from "vite";
import path from "path";
import { loadEnv } from "vite";

// Plugin to serve service worker with correct MIME type
const serviceWorkerPlugin = (): Plugin => ({
  name: "service-worker-mime",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === "/firebase-messaging-sw.js") {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        res.setHeader("Service-Worker-Allowed", "/");
      }
      next();
    });
  },
});

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss(), serviceWorkerPlugin()],

    // تحسينات الأداء
    build: {
      target: "es2015",
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // فصل المكتبات الكبيرة لتحسين التحميل بشكل ديناميكي
            if (id.includes("node_modules")) {
              // ✅ CRITICAL: Keep React and React-DOM together to avoid createContext errors
              if (
                id.includes("react") ||
                id.includes("react-dom") ||
                id.includes("react/")
              ) {
                return "react-vendor";
              }
              if (id.includes("react-router")) {
                return "react-vendor"; // Keep router with React
              }
              if (id.includes("lucide-react")) {
                return "lucide-icons";
              }
              if (id.includes("react-icons")) {
                return "react-icons";
              }
              if (id.includes("chart.js") || id.includes("react-chartjs")) {
                return "charts";
              }
              if (id.includes("axios") || id.includes("socket.io")) {
                return "api-vendor";
              }
              if (id.includes("framer-motion")) {
                return "animations";
              }
              if (id.includes("firebase")) {
                return "firebase";
              }
              // باقي المكتبات في vendor عام
              return "vendor";
            }
          },
        },
      },
      // ✅ استخدام esbuild للضغط (أسرع وأكثر أماناً من terser)
      minify: "esbuild",
      // تحسين الـ sourcemaps
      sourcemap: false,
      // تقسيم CSS إلى ملفات منفصلة
      cssCodeSplit: true,
      // ✅ تحسين حجم الأصول - زيادة الحد لتقليل HTTP requests
      assetsInlineLimit: 8192, // 8kb بدلاً من 4kb
      // ✅ تفعيل reportCompressedSize لمراقبة الحجم
      reportCompressedSize: true,
      // ✅ تقليل حجم chunks
      chunkSizeWarningLimit: 500,
    },

    // تحسين الخادم المحلي
    server: {
      port: 5173,
      host: "localhost",
      hmr: {
        protocol: "ws",
        host: "localhost",
        overlay: false,
      },
      fs: {
        strict: false,
      },
      // إعداد البروكسي لتوجيه طلبات API إلى الباك اند
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:5005",
          changeOrigin: true,
          secure: false,
        },
      },
      headers: {
        // Set proper MIME type for service worker
        "Service-Worker-Allowed": "/",
      },
    },

    // Public directory configuration
    publicDir: "public",

    // تحسين حل الملفات
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      // ✅ CRITICAL: Ensure only one React instance is used
      dedupe: ["react", "react-dom"],
    },

    // تحسين معالجة CSS
    css: {
      devSourcemap: false,
    },

    // تحسين dependencies
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "axios",
        "lucide-react",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      exclude: ["@vite/client", "@vite/env"],
      // ✅ Force React to be treated as a single module
      esbuildOptions: {
        preserveSymlinks: false,
      },
    },
  };
});
