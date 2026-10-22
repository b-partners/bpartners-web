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
    return Array.isArray(parsed) ? parsed : parsed.timings ?? [];
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

const DOWNLOADS_DIR = path.resolve('cypress/downloads');

/** How much of the report's own words are carried back, which is plenty to tell its sections apart. */
const PDF_TEXT_BUDGET = 20_000;

interface PdfSummary {
  name: string;
  bytes: number;
  /** The two marks a whole PDF sits between: its header, and the trailer a finished write ends on. */
  isPdf: boolean;
  hasEof: boolean;
  pages: number;
  text: string;
}

/**
 * The newest downloaded report whose name carries `match`, read the way a reader would read it: the
 * file is parsed, so the page count is the document's own and the text is what is printed on it.
 */
const inspectPdfDownload = async ({ match, since = 0 }: { match: string; since?: number }): Promise<PdfSummary | null> => {
  if (!fs.existsSync(DOWNLOADS_DIR)) return null;
  const [newest] = fs
    .readdirSync(DOWNLOADS_DIR)
    .filter(name => name.endsWith('.pdf') && name.includes(match))
    .map(name => ({ name, file: path.join(DOWNLOADS_DIR, name) }))
    .map(entry => ({ ...entry, at: fs.statSync(entry.file).mtimeMs }))
    .filter(entry => entry.at >= since)
    .sort((left, right) => right.at - left.at);
  if (!newest) return null;

  const buffer = fs.readFileSync(newest.file);
  const head = buffer.subarray(0, 8).toString('latin1');
  const tail = buffer.subarray(-64).toString('latin1');
  const pdfjs: any = await import('pdfjs-dist/legacy/build/pdf.js');
  const getDocument = pdfjs.getDocument ?? pdfjs.default?.getDocument;
  const document = await getDocument({ data: new Uint8Array(buffer), useSystemFonts: false }).promise;

  const pages: string[] = [];
  for (let number = 1; number <= document.numPages; number += 1) {
    const page = await document.getPage(number);
    pages.push((await page.getTextContent()).items.map((item: any) => item.str ?? '').join(' '));
    if (pages.join(' ').length > PDF_TEXT_BUDGET) break;
  }

  return {
    name: newest.name,
    bytes: buffer.length,
    isPdf: head.startsWith('%PDF-'),
    hasEof: tail.trimEnd().endsWith('%%EOF'),
    pages: document.numPages,
    text: pages.join('\n').slice(0, PDF_TEXT_BUDGET),
  };
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
        inspectPdfDownload,
        recordTiming(entry: Omit<Timing, 'at'>) {
          const timings = readTimings();
          timings.push({ ...entry, at: new Date().toISOString() });
          writeTimings(timings);
          console.log(`⏱️ [${entry.step}] ${entry.ms}ms — ${entry.spec} :: ${entry.test}`);
          return null;
        },
      });

      on('after:run', () => {
        const timings = readTimings();
        if (timings.length === 0) return;
        console.log('\n⏱️  Annotator timings summary (average per step):');
        console.table(buildSummary(timings));
        console.log(`⏱️  Full report written to ${TIMINGS_FILE}\n`);
      });

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

    // The annotator specs are the Instatus monitoring's own, launched one by one by their workflows:
    // kept out of the plain IT run, which has no business re-walking a 3D generation.
    excludeSpecPattern: process.env.EXCLUDE_INSTATUS_IT_SPEC === 'true' ? ['src/__tests__/it/annotator/*.it.cy.ts'] : [],
    specPattern: 'src/**/*.it.cy.{js,ts,jsx,tsx}',
  },
});
