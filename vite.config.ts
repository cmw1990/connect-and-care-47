import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import tailwindNesting from 'tailwindcss/nesting';

export default defineConfig(({ mode }) => ({
  server: {
    port: 4001,
    strictPort: true, // Force the specified port
    host: true, // Listen on all addresses
    hmr: {
      overlay: true,
    },
  },
  preview: {
    port: 4001,
    strictPort: true,
    host: true,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [
        tailwindNesting,
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  build: {
    target: 'esnext'
  }
}));