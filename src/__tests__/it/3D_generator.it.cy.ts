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

const createParthenayAnnotation = () => {
  cy.dataCy(canvas_cursor_sel).click(661, 234, { force: true });
  cy.dataCy(canvas_cursor_sel).click(645, 277, { force: true });
  cy.dataCy(canvas_cursor_sel).click(668, 284, { force: true });
  cy.dataCy(canvas_cursor_sel).click(691, 284, { force: true });
  cy.dataCy(canvas_cursor_sel).click(705, 247, { force: true });
  cy.dataCy(canvas_cursor_sel).click(661, 234, { force: true });
};

const createCannesAnnotation = () => {
  cy.dataCy(canvas_cursor_sel).click(571, 227, { force: true });
  cy.dataCy(canvas_cursor_sel).click(506, 208, { force: true });
  cy.dataCy(canvas_cursor_sel).click(504, 254, { force: true });
  cy.dataCy(canvas_cursor_sel).click(555, 268, { force: true });
  cy.dataCy(canvas_cursor_sel).click(571, 227, { force: true });
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
  {
    name: 'Generate 3D on 1 Rue de la Vau Saint-Jacques, 79200 Parthenay, France',
    address: '1 Rue de la Vau Saint-Jacques, 79200 Parthenay, France',
    annotation: createParthenayAnnotation,
    imageFixture: 'raw.jpeg',
  },
  {
    name: 'Generate 3D on 12 Boulevard de la Croisette, 06400 Cannes',
    address: '12 Boulevard de la Croisette, 06400 Cannes',
    annotation: createCannesAnnotation,
    imageFixture: 'raw.jpeg',
  },
];

let prospectId: string;

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
      cy.intercept('PUT', 'accountHolders/**/prospects**').as('createProspect');
      cy.intercept('GET', 'accounts/**/files/**/raw**').as('getImage');

      cy.contains('Générer l’image').should('be.visible').click();

      cy.wait('@createAreaPicture', { timeout: 120000 }).then(interception => {
        expect(interception.response.statusCode).to.eq(200);
      });
      cy.wait('@createProspect').then(prospect => {
        prospectId = prospect.response?.body[0].id;
        cy.log(`PROSPECT ID ${prospectId}`);
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

  afterEach(function () {
    const test = this.currentTest;
    recordCypressTestResult({
      testName: test?.title ?? 'UNKNOWN',
      status: test?.state === 'passed' ? 'SUCCESS' : 'FAILED',
      error: test?.err?.message ?? undefined,
    });
    cy.log(`Prospect id to delete = ${prospectId}`);
    cy.request({
      method: 'DELETE',
      url: `${process.env.REACT_APP_BPARTNERS_API_URL}/prospect/${prospectId}`,
      headers: {
        'x-api-key': process.env.DASHBOARD_ADMIN_API_KEY,
      },
      failOnStatusCode: false,
    });
  });

  const RESPONSE_TIME_THRESHOLD = 140000;

  after(() => {
    cy.then(() => {
      const hasFailed = testResults.some(r => r.status === 'FAILED');
      const isSlow = testResults.some(r => r.responseTime > RESPONSE_TIME_THRESHOLD);
      const hasCypressTestFailed = cypressTestResult.some(r => r.status === 'FAILED');

      cy.log(`TestResults = ${JSON.stringify(testResults, null, 2)}`);
      cy.log(`CypressTestResults = ${JSON.stringify(cypressTestResult, null, 2)}`);

      cy.task('getOpenInstatusIncident').then((incident: any) => {
        const incidentId = incident?.id ?? null;
        const incidentStatus = incident?.status ?? null;

        cy.log('Incident ID dans le test', incidentId);
        cy.log('Status ID dans le test', incidentStatus);

        if (hasCypressTestFailed) {
          const failedTests = cypressTestResult
            .filter(r => r.status == 'FAILED')
            .map(r => `${r.testName} (${r.error})`)
            .join(', ');

          if (!incidentId) {
            return cy.task('createInstatusIncident', {
              name: '[Cypress Error] Failed to process 3D convertion',
              message: `Cypress test failed, ${failedTests}`,
              status: 'IDENTIFIED',
              componentStatus: 'DEGRADEDPERFORMANCE',
            });
          } else if (incidentId && incidentStatus != 'IDENTIFIED') {
            return cy.task('updateInstatusIncident', {
              incidentId,
              message: `Cypress test failed, ${failedTests}`,
              status: 'IDENTIFIED',
              componentStatus: 'DEGRADEDPERFORMANCE',
            });
          }
        }
        if (hasFailed) {
          const failedTests = testResults
            .filter(r => r.status == 'FAILED')
            .map(r => `${r.testName} (${r.responseTime}ms)`)
            .join(', ');

          if (!incidentId) {
            return cy.task('createInstatusIncident', {
              name: '[3D] Failed to process convertion',
              message: `Failed to generate 3D on : ${failedTests}`,
              status: 'INVESTIGATING',
              componentStatus: 'MAJOROUTAGE',
            });
          } else if (incidentId && incidentStatus != 'INVESTIGATING') {
            return cy.task('updateInstatusIncident', {
              incidentId,
              message: `Failed to generate 3D on : ${failedTests}`,
              status: 'INVESTIGATING',
              componentStatus: 'MAJOROUTAGE',
            });
          }
        } else if (isSlow) {
          const slowTests = testResults
            .filter(r => r.responseTime > RESPONSE_TIME_THRESHOLD)
            .map(r => `${r.testName} (${r.responseTime}ms)`)
            .join(', ');

          if (incidentId && incidentStatus != 'MONITORING') {
            return cy.task('updateInstatusIncident', {
              incidentId,
              message: `Convertion took too much time on : ${slowTests}`,
              status: 'MONITORING',
              componentStatus: 'PARTIALOUTAGE',
            });
          } else if (!incidentId) {
            return cy.task('createInstatusIncident', {
              name: '[3D] Slow conversion detected',
              message: `Convertion took too much time on : ${slowTests}`,
              status: 'MONITORING',
              componentStatus: 'PARTIALOUTAGE',
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
