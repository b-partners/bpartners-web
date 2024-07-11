import { defineConfig } from 'cypress';
import mergeReports from 'cypress-sonarqube-reporter/mergeReports';

export default defineConfig({
  video: false,

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
      on('after:run', result => {
        mergeReports(result, { mergeFileName: 'test-reports.xml' });
      });
    },
    specPattern: 'src/**/*.cy.{js,ts,jsx,tsx}',
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
