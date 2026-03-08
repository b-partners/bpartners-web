import { cypressTestResult, recordCypressTestResult, testResults } from '../../../cypress/support/instatus-helper';
import { recallAsyncProcess } from './awaitAsyncProcess.it.cy';

const canvas_cursor_sel = 'annotator-canvas-cursor';

const createLyonAnnotation = () => {
  cy.dataCy(canvas_cursor_sel).click(467, 294, { force: true });
  cy.dataCy(canvas_cursor_sel).click(515, 311, { force: true });
  cy.dataCy(canvas_cursor_sel).click(543, 248, { force: true });
  cy.dataCy(canvas_cursor_sel).click(495, 228, { force: true });
  cy.dataCy(canvas_cursor_sel).click(467, 294, { force: true });
};

const createDijonAnnotation = () => {
  cy.dataCy(canvas_cursor_sel).click(557, 368, { force: true });
  cy.dataCy(canvas_cursor_sel).click(519, 352, { force: true });
  cy.dataCy(canvas_cursor_sel).click(557, 288, { force: true });
  cy.dataCy(canvas_cursor_sel).click(592, 305, { force: true });
  cy.dataCy(canvas_cursor_sel).click(557, 368, { force: true });
};

const testCases = [
  {
    name: 'Generate 3D on 6 Place de la Libération, 21000 Dijon',
    address: '6 Place de la Libération, 21000 Dijon',
    annotation: createDijonAnnotation,
    imageFixture: 'dijon.jpeg',
  },
  {
    name: 'Generate 3D on 2 Place Bellecour, 69002 Lyon',
    address: '2 Place Bellecour, 69002 Lyon',
    annotation: createLyonAnnotation,
    imageFixture: 'raw.jpeg',
  },
];

const printCanvasPixelOnDeveloperTools = () => {
  cy.dataCy(canvas_cursor_sel).then(($canvas: any) => {
    const canvas = $canvas[0];
    canvas.addEventListener('click', (e: any) => {
      console.log(e.offsetX, e.offsetY);
    });
  });
};

describe('Generate 3D', () => {
  beforeEach(() => {
    cy.realCognitoLogin();
    cy.e2eLogin();
  });

  testCases.forEach(testCase => {
    it(`on ${testCase.name}`, () => {
      let requestStartTime: any;
      let requestEndTime;

      cy.get('[name="prospects"]').click();
      cy.contains('Ajouter un prospect').click();

      cy.get('[data-testid="address-auto-complete"]').clear().type(testCase.address);
      cy.get('[data-testid="name-field-input"]').clear().type('Doe');

      cy.intercept('PUT', 'accounts/**/areaPictures/**').as('createAreaPicture');
      cy.intercept('GET', 'accounts/**/files/**/raw**').as('getImage');

      cy.contains('Générer l’image').should('be.visible').click();

      cy.wait('@createAreaPicture', { timeout: 120000 }).then(interception => {
        expect(interception.response.statusCode).to.eq(200);
      });
      cy.wait('@getImage');
      cy.wait(5000);

      testCase.annotation();

      cy.intercept('POST', 'mercator**', () => {
        requestStartTime = Date.now();
      }).as('pixelConvertion');

      cy.intercept('PUT', 'city-jsons/**/process**').as('3DConvertion');

      cy.contains('Passer sur la version 3D').should('be.visible').click();

      cy.wait('@pixelConvertion', { timeout: 10000 }).then(interception => {
        requestEndTime = Date.now();
        const apiResponseTime = requestEndTime - requestStartTime;

        cy.log(`Conversion pixel : ${apiResponseTime} ms`);
        expect(interception.response.statusCode).to.eq(200);
      });

      cy.get('[data-testid="bp-loader-wrapper"]').should('be.visible');

      recallAsyncProcess(testCase.address, Date.now()).then(responseTime => {
        cy.log(`Temps total conversion 3D : ${responseTime} ms`);
      });
    });
  });

  afterEach(function() {
    const test = this.currentTest
    recordCypressTestResult({
      testName: test?.title ?? 'UNKNOWN',
      status: test?.state === 'passed' ? 'SUCCESS' : 'FAILED',
      error: test?.err?.message ?? undefined,
    })
  })

  let RESPONSE_TIME_THRESHOLD = 130000

  after(() => {
    cy.then(() => {
      const hasFailed = testResults.some((r) => r.status === 'FAILED');
      const isSlow = testResults.some((r) => r.responseTime > RESPONSE_TIME_THRESHOLD);
      const hasCypressTestFailed = cypressTestResult.some((r) => r.status === 'FAILED');
      
      cy.log(`TestResults = ${JSON.stringify(testResults, null, 2)}`)
      cy.task('getOpenInstatusIncident').then((incidentId) => {

        cy.log('Incident ID dans le test:', incidentId);

        if(hasCypressTestFailed){
          const failedTests = cypressTestResult
            .filter((r) => r.status == 'FAILED')
            .map((r) => `${r.testName} (${r.error})`)
            .join(', ');

          if (!incidentId) {
            return cy.task('createInstatusIncident', {
              name: '[Cypress Error] Failed to process 3D convertion',
              message: `Cypress test failed, error on =${failedTests}`,
              status: 'INVESTIGATING',
              componentStatus: 'PARTIALOUTAGE',
            })
          }
          return cy.task('updateInstatusIncident', {
            incidentId,
            message: `Cypress test failed, error on =${failedTests}`,
            status: 'INVESTIGATING',
            componentStatus: 'PARTIALOUTAGE',
          });
        }
        if (hasFailed) {
          const failedTests = testResults
            .filter((r) => r.status == 'FAILED')
            .map((r) => `${r.testName} (${r.responseTime}ms)`)
            .join(', ');

          if (!incidentId) {
            return cy.task('createInstatusIncident', {
              name: '[3D] Failed to process 3D convertion',
              message: `Failed on : ${failedTests}`,
              status: 'INVESTIGATING',
              componentStatus: 'MAJOROUTAGE',
            })
          }
          return cy.task('updateInstatusIncident', {
            incidentId,
            message: `Failed on : ${failedTests}`,
            status: 'INVESTIGATING',
            componentStatus: 'MAJOROUTAGE'
          });
        } else if (isSlow) {
          const slowTests = testResults
            .filter((r) => r.responseTime > RESPONSE_TIME_THRESHOLD)
            .map((r) => `${r.testName} (${r.responseTime}ms)`)
            .join(', ');

          if (incidentId) {
            return cy.task('updateInstatusIncident', {
              incidentId,
              message: `[3D] Convertion took too much time : ${slowTests}`,
              status: 'MONITORING',
              componentStatus: 'PARTIALOUTAGE'
            });
          } else {
            return cy.task('createInstatusIncident', {
              name: '[3D] Convertion took too much time',
              message: `[3D] Convertion took too much time : ${slowTests}`,
              status: 'MONITORING',
              componentStatus: 'PARTIALOUTAGE'
            });
          }
        } else {
          if (incidentId) {
            return cy.task('resolveInstatusIncident', { incidentId });
          }
        }
      });
    });
  });
});