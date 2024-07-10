import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,

  retries: {
    runMode: 3,
    openMode: 0,
  },

  viewportWidth: 2014,
  viewportHeight: 844,
  defaultCommandTimeout: 30000,
  reporter: 'cypress-multi-reporters',

  reporterOptions: {
    reporterEnabled: 'cypress-sonarqube-reporter',
    mergeFileName: 'test-reports.xml',
    cypressSonarqubeReporterReporterOptions: {
      overwrite: true,
    },
  },

  projectId: '4f6tz2',

  component: {
    setupNodeEvents(on, config) {},
    specPattern: 'src/**/*.cy.{js,ts,jsx,tsx}',
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});