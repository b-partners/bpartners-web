import taskCoverage from '@cypress/code-coverage/task.js';
import { defineConfig } from 'cypress';
import vitePreprocessor from 'cypress-vite';

const INSTATUS_API_KEY = process.env.INSTATUS_API_KEY;
const INSTATUS_PAGE_ID = process.env.INSTATUS_PAGE_ID;
const INSTATUS_COMPONENT_ID =process.env.INSTATUS_3D_COMPONENT_ID;
const BASE_URL = `https://api.instatus.com/v1/${INSTATUS_PAGE_ID}`;

const instatusHeaders = {
  'Authorization': `Bearer ${INSTATUS_API_KEY}`,
  'Content-Type': 'application/json',
};

export default defineConfig({
  env: {
    codeCoverage: {
      exclude: ['cypress/**/*', 'src/**/*.cy.*'],
    }
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
       on('task', {
        
        async getOpenInstatusIncident() {
          try {
            const res = await fetch(`${BASE_URL}/incidents`, {
              headers: instatusHeaders,
              signal: AbortSignal.timeout(10000), // 10s timeout
            });
            
            if (!res.ok) {
              throw new Error(`Failed to fetch incidents, status code: ${res.status}`);
            }

            const text = await res.text(); 
            const data = JSON.parse(text);
            console.log('Parsed data:', data);

            if (data && Array.isArray(data)) {
              const openIncident = data
                .filter((i: any) =>
                  i.status !== 'RESOLVED' &&
                  i.components?.some((c: any) => c.id === INSTATUS_COMPONENT_ID)
                )
                .sort((a: any, b: any) => new Date(b.started).getTime() - new Date(a.started).getTime())[0];
  
              return openIncident? {id: openIncident.id, status: openIncident.status} : null;
            } else {
              throw new Error('Data is not an array or is empty');
            }
          } catch (error) {
            throw new Error(`Error fetching incident: ${error}`);
          }
        },

        async createInstatusIncident({ name, message, status, componentStatus }) {
          try {
            const res = await fetch(`${BASE_URL}/incidents`, {
              method: 'POST',
              headers: instatusHeaders,
              body: JSON.stringify({
                name: name,
                message: message,
                components: [INSTATUS_COMPONENT_ID],
                status: status,
                notify: true,
                statuses: [{ id: INSTATUS_COMPONENT_ID, status: componentStatus }],
              }),
            });

            if (!res.ok) {
              throw new Error(`Failed to create incident, status code: ${res.status}`);
            }

            const data = await res.json();
            return data.id;
          } catch (error) {
            throw new Error(`Error creating incident: ${error}`);
          }
        },

        async updateInstatusIncident({ incidentId, message, status, componentStatus }) {
          try {
            const res = await fetch(`${BASE_URL}/incidents/${incidentId}/incident-updates`, {
              method: 'POST',
              headers: instatusHeaders,
              body: JSON.stringify({
                message: message,
                started: new Date().toISOString(),
                components: [INSTATUS_COMPONENT_ID],
                status: status,
                notify: true,
                statuses: [
                  {
                    id: INSTATUS_COMPONENT_ID,
                    status: componentStatus
                  }
                ],
              }),
            });

            if (!res.ok) {
              throw new Error(`Failed to update incident, status code: ${res.status}`);
            }

            return null;
          } catch (error) {
            throw new Error(`Error updating incident:${error}`);
          }
        },

        async resolveInstatusIncident({ incidentId }) {
          try {
            const res = await fetch(`${BASE_URL}/incidents/${incidentId}/incident-updates`, {
              method: 'POST',
              headers: instatusHeaders,
              body: JSON.stringify({
                message: "3D Generation succeeded",
                started: new Date().toISOString(),
                components: [INSTATUS_COMPONENT_ID],
                status: "RESOLVED",
                notify: true,
                statuses: [
                  {
                    id: INSTATUS_COMPONENT_ID,
                    status: "OPERATIONAL"
                  }
                ]
              }),
            });

            if (!res.ok) {
              throw new Error(`Failed to resolve incident, status code: ${res.status}`);
            }

            return null;
          } catch (error) {
            throw new Error(`Error resolving incident:${error}`);
          }
        }
      });
    },
    specPattern: 'src/**/*.it.cy.{js,ts,jsx,tsx}'
    }
});
