import taskCoverage from '@cypress/code-coverage/task.js';
import { defineConfig } from 'cypress';
import vitePreprocessor from 'cypress-vite';
import * as dotenv from 'dotenv';
dotenv.config();

const INSTATUS_API_KEY = process.env.INSTATUS_API_KEY;
const INSTATUS_PAGE_ID = process.env.INSTATUS_PAGE_ID;
const BASE_URL = `https://api.instatus.com/v1/${INSTATUS_PAGE_ID}`;
const IS_3D_MONITORING = process.env.IS_MONITORING_INSTATUS_3D;

const instatusHeaders = {
  Authorization: `Bearer ${INSTATUS_API_KEY}`,
  'Content-Type': 'application/json',
};

export default defineConfig({
  env: {
    codeCoverage: {
      exclude: ['cypress/**/*', 'src/**/*.cy.*'],
    },
  },

  video: true,

  retries: {
    runMode: 3,
    openMode: 0,
  },

  viewportWidth: 2014,
  viewportHeight: 844,
  defaultCommandTimeout: 30000,
  projectId: '4f6tz2',
  reporter: 'cypress-multi-reporters',

  reporterOptions: {
    reporterEnabled: 'cypress-sonarqube-reporter',
    mergeFileName: 'test-reports.xml',
    cypressSonarqubeReporterReporterOptions: {
      overwrite: true,
    },
  },

  component: {
    setupNodeEvents(on, config) {
      taskCoverage(on, config);
      return config;
    },
    specPattern: 'src/**/!(*.it).cy.{js,ts,jsx,tsx}',
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },

  e2e: {
    setupNodeEvents(on, _config) {
      on('file:preprocessor', vitePreprocessor());
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium') {
          launchOptions.args.push('--use-gl=angle');
          launchOptions.args.push('--use-angle=swiftshader');
          launchOptions.args.push('--enable-webgl');
          launchOptions.args.push('--ignore-gpu-blocklist');
          launchOptions.args.push('--enable-unsafe-swiftshader'); // requis sur Chrome récent
        }
        return launchOptions;
      });
    },

    excludeSpecPattern:
      process.env.EXCLUDE_INSTATUS_IT_SPEC === 'true' ? ['src/__tests__/it/3D_generator.it.cy.ts', 'src/__tests__/it/detection.it.cy.ts'] : [],
    specPattern: 'src/**/*.it.cy.{js,ts,jsx,tsx}',
  },
});
