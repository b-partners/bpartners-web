import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import istanbul from 'vite-plugin-istanbul';
import viteTsconfigPaths from 'vite-tsconfig-paths';

const DEFAULT_GEOSERVER_ORIGIN = 'http://35.181.83.111';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geoserverOrigin = env.GEOSERVER_ORIGIN || DEFAULT_GEOSERVER_ORIGIN;
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
      proxy: {
        // The annotator reads its imagery cells with fetch, which needs a same-origin, CORS-clean url; the
        // GeoServer sends no CORS headers. Dev-server only — a deployed build needs its own proxy, set
        // through REACT_APP_WMS_TILE_BASE_URL.
        '/wms-proxy': {
          target: geoserverOrigin,
          changeOrigin: true,
          rewrite: (requestPath: string) => requestPath.replace(/^\/wms-proxy/, '/geoserver/cite/wms'),
        },
      },
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
