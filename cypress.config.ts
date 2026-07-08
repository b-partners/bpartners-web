import taskCoverage from '@cypress/code-coverage/task.js';
import { defineConfig } from 'cypress';
import vitePreprocessor from 'cypress-vite';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
dotenv.config();

const TIMINGS_FILE = path.resolve('cypress/results/annotator-timings.json');

interface Timing {
  spec: string;
  test: string;
  step: string;
  ms: number;
  at: string;
}

interface TimingsReport {
  timings: Timing[];
  summary: Record<string, { averageMs: number; count: number }>;
}

const ensureTimingsFile = () => {
  const dir = path.dirname(TIMINGS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const readTimings = (): Timing[] => {
  if (!fs.existsSync(TIMINGS_FILE)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(TIMINGS_FILE, 'utf-8'));
    return Array.isArray(parsed) ? parsed : (parsed.timings ?? []);
  } catch {
    return [];
  }
};

const buildSummary = (timings: Timing[]): TimingsReport['summary'] => {
  const byStep: Record<string, number[]> = {};
  timings.forEach(({ step, ms }) => {
    byStep[step] = byStep[step] ?? [];
    byStep[step].push(ms);
  });
  return Object.fromEntries(
    Object.entries(byStep).map(([step, values]) => [step, { averageMs: Math.round(values.reduce((a, b) => a + b, 0) / values.length), count: values.length }])
  );
};

const writeTimings = (timings: Timing[]) => {
  ensureTimingsFile();
  const report: TimingsReport = { summary: buildSummary(timings), timings };
  fs.writeFileSync(TIMINGS_FILE, JSON.stringify(report, null, 2));
};

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

      writeTimings([]);

      on('task', {
        recordTiming(entry: Omit<Timing, 'at'>) {
          const timings = readTimings();
          timings.push({ ...entry, at: new Date().toISOString() });
          writeTimings(timings);
          console.log(`⏱️ [${entry.step}] ${entry.ms}ms — ${entry.spec} :: ${entry.test}`);
          return null;
        },

        async getOpenInstatusIncident({ componentId }) {
          try {
            console.log(`Check if there is an open incident on ${IS_3D_MONITORING === 'true' ? '3D component' : 'Detection Component'}`);
            const res = await fetch(`${BASE_URL}/incidents`, {
              headers: instatusHeaders,
              signal: AbortSignal.timeout(30000),
            });

            if (!res.ok) {
              throw new Error(`Failed to fetch incidents, status code: ${res.status}`);
            }

            const text = await res.text();
            const data = JSON.parse(text);

            if (data && Array.isArray(data)) {
              console.log('Component Id = ' + componentId);
              const openIncident = data
                .filter(i => i.status !== 'RESOLVED' && i.components?.some(c => c.id === componentId))
                .sort((a, b) => new Date(b.started).getTime() - new Date(a.started).getTime())[0];

              return openIncident ? { id: openIncident.id, status: openIncident.status } : null;
            } else {
              throw new Error('Data is not an array or is empty');
            }
          } catch (error) {
            throw new Error(`Error fetching incident: ${error}`);
          }
        },

        async createInstatusIncident({ componentId, name, message, status, componentStatus }) {
          try {
            console.log(`Create incident on : ${name}, error message = ${message}`);
            const res = await fetch(`${BASE_URL}/incidents`, {
              method: 'POST',
              headers: instatusHeaders,
              body: JSON.stringify({
                name: name,
                message: message,
                components: [componentId],
                status: status,
                notify: true,
                statuses: [{ id: componentId, status: componentStatus }],
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

        async updateInstatusIncident({ componentId, incidentId, message, status, componentStatus }) {
          try {
            console.log(`Update incident ${incidentId} : ${message}`);
            const res = await fetch(`${BASE_URL}/incidents/${incidentId}/incident-updates`, {
              method: 'POST',
              headers: instatusHeaders,
              body: JSON.stringify({
                message: message,
                started: new Date().toISOString(),
                components: [componentId],
                status: status,
                notify: true,
                statuses: [
                  {
                    id: componentId,
                    status: componentStatus,
                  },
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

        async resolveInstatusIncident({ componentId, incidentId, message }) {
          try {
            console.log(`Resolve incident : ${incidentId}`);
            const res = await fetch(`${BASE_URL}/incidents/${incidentId}/incident-updates`, {
              method: 'POST',
              headers: instatusHeaders,
              body: JSON.stringify({
                message: message,
                started: new Date().toISOString(),
                components: [componentId],
                status: 'RESOLVED',
                notify: true,
                statuses: [
                  {
                    id: componentId,
                    status: 'OPERATIONAL',
                  },
                ],
              }),
            });

            if (!res.ok) {
              throw new Error(`Failed to resolve incident, status code: ${res.status}`);
            }

            return null;
          } catch (error) {
            throw new Error(`Error resolving incident:${error}`);
          }
        },
      });

      on('after:run', () => {
        const timings = readTimings();
        if (timings.length === 0) return;
        console.log('\n⏱️  Annotator timings summary (average per step):');
        console.table(buildSummary(timings));
        console.log(`⏱️  Full report written to ${TIMINGS_FILE}\n`);
      });
    },

    excludeSpecPattern:
      process.env.EXCLUDE_INSTATUS_IT_SPEC === 'true' ? ['src/__tests__/it/3D_generator.it.cy.ts', 'src/__tests__/it/detection.it.cy.ts'] : [],
    specPattern: 'src/**/*.it.cy.{js,ts,jsx,tsx}',
  },
});
