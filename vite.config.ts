import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import tailwindNesting from 'tailwindcss/nesting';

export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8080,
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