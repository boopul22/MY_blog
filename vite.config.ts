import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isAnalyze = process.env.ANALYZE === 'true';

    return {
      plugins: [
        tailwindcss(),
        // Bundle analyzer - only in analyze mode
        ...(isAnalyze ? [
          visualizer({
            filename: 'dist/stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true,
          })
        ] : []),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        historyApiFallback: true,
      },
      preview: {
        historyApiFallback: true,
      },
      build: {
        // Optimize bundle splitting
        rollupOptions: {
          output: {
            manualChunks: {
              // Vendor chunks
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
              'supabase-vendor': ['@supabase/supabase-js'],
              // Admin-only chunks (will be lazy loaded)
              'admin-vendor': ['@tinymce/tinymce-react', 'tinymce'],
              'charts-vendor': ['recharts'],
            },
          },
        },
        // Enable source maps for analysis
        sourcemap: isAnalyze,
        // Set chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Minification options
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
            drop_debugger: mode === 'production',
          },
        },
        // Target modern browsers for better optimization
        target: 'esnext',
      },
    };
});
