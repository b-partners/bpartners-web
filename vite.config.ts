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
      istanbul({
        cypress: true,
        requireEnv: false,
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
