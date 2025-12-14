/**
 * Vite Library Build Configuration
 *
 * Builds the UI components as a library for consumers to import.
 * This is separate from the main vite.config.ts which builds the
 * standalone control panel SPA.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: '../dist-ui-lib',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/components/index.ts'),
      name: 'QwickAppsServerUI',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-router-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
        '@qwickapps/react-framework',
      ],
      output: {
        // Preserve module structure for tree-shaking
        preserveModules: false,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
          '@mui/material': 'MuiMaterial',
          '@qwickapps/react-framework': 'QwickAppsReactFramework',
        },
      },
    },
  },
});
