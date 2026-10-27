import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

// Generates static route entry points (e.g. dist/bongthom/index.html and dist/404.html)
// so direct links like https://ip-portal.onrender.com/bongthom work out-of-the-box on Render Static Sites.
function spaStaticRoutesPlugin() {
  return {
    name: 'spa-static-routes',
    closeBundle() {
      const distDir = path.resolve(import.meta.dirname, 'dist');
      const indexHtml = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexHtml)) return;

      const routes = [
        'bongthom',
        'login',
        'auth',
        'schedule',
        'rooms',
        'room',
        'lecturers',
        'lecturer',
        'agenda',
        'daily',
        'clubs',
        'club',
        'free-rooms',
        'booking',
        'makeup',
        'release-notes',
        'changelog',
        'privacy',
        'privacy-policy',
        'terms',
        'terms-of-service',
        'tos',
      ];

      for (const route of routes) {
        const routeDir = path.join(distDir, route);
        fs.mkdirSync(routeDir, {recursive: true});
        fs.copyFileSync(indexHtml, path.join(routeDir, 'index.html'));
      }

      fs.copyFileSync(indexHtml, path.join(distDir, '404.html'));
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

