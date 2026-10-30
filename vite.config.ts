import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

// Generates dist/404.html fallback alongside Render's /* -> /index.html Rewrite rule
// and strips temporary AI Studio chat attachments from production build output
function spaStaticRoutesPlugin() {
  return {
    name: 'spa-static-routes',
    closeBundle() {
      const distDir = path.resolve(import.meta.dirname, 'dist');
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        fs.copyFileSync(indexHtml, path.join(distDir, '404.html'));
      }
      const aiStudioTempAssets = path.join(distDir, 'assets', 'aistudio');
      if (fs.existsSync(aiStudioTempAssets)) {
        fs.rmSync(aiStudioTempAssets, { recursive: true, force: true });
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), spaStaticRoutesPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

