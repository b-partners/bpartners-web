import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import istanbul from 'vite-plugin-istanbul';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env': env,
    },
    plugins: [
      react(),
      viteTsconfigPaths(),
      // Instrumentation is only wanted when a run collects coverage: gating it keeps it out of the
      // production bundle and off the local component run, which pays for it on every spec.
      istanbul({
        cypress: true,
        requireEnv: true,
        include: 'src/*',
        exclude: ['node_modules', 'cypress', 'src/**/*.cy.*'],
      }),
    ],
    server: {
      port: 3000,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'build',
      sourcemap: 'hidden',
    },
  };
});
