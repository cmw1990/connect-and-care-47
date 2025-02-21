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
    host: true,
    strictPort: true,
    watch: {
      usePolling: false, // Disable polling to prevent excessive refreshes
    },
    hmr: {
      overlay: true,
      timeout: 5000, // Increase timeout
    },
  },
  preview: {
    port: 4001,
    strictPort: true,
    host: true,
  },
  plugins: [
    react({
      fastRefresh: true, // Enable fast refresh
    }),
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
    target: 'esnext',
    sourcemap: true,
  },
  optimizeDeps: {
    force: true, // Force dependency pre-bundling
  }
}));