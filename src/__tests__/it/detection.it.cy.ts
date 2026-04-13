import {
  createLyonAnnotation,
  createParthenayAnnotationDetection,
  cypressTestResult,
  recordCypressTestResult,
  recordTestResult,
  testResults,
} from '../../../cypress/support/instatus-helper';
import { recallDetectionGetById } from './awaitAsyncProcess.it.cy';

const testCases = [
  {
    name: 'Generate 3D on 2 Place Bellecour, 69002 Lyon',
    address: '2 Place Bellecour, 69002 Lyon',
    annotation: createLyonAnnotation,
    surface: 294.21,
    contains: ['Usure Importante', 'Moisissure Clair', 'Cheminee', /Velux \w/, /Obstacle \w/],
  },
  {
    name: 'Generate 3D on 1 Rue de la Vau Saint-Jacques, 79200 Parthenay, France',
    address: '1 Rue de la Vau Saint-Jacques, 79200 Parthenay, France',
    annotation: createParthenayAnnotationDetection,
    surface: 218.75,
    contains: ['Usure Importante', 'Moisissure Noircie', 'Moisissure Clair', 'Cheminee', /Velux \w/],
  },
];

describe('Roof detection', () => {
  beforeEach(() => {
    cy.realCognitoLogin();
    cy.e2eLogin();
  });

  let prospectId: string;

  testCases.forEach(testCase => {
    it(`on ${testCase.address}`, () => {
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

      cy.intercept('POST', 'detections/**/sync**').as('processDetection');
      cy.intercept('GET', 'detections/**').as('getDetectionById');

      cy.contains('Analyser la toiture').should('be.visible').click();

      const requestStartTime = Date.now();
      cy.wait('@processDetection', { timeout: 60000 }).then(res => {
        const apiResponseTime = Date.now() - requestStartTime;
        if (res.response?.body.step.status.progression == 'FINISHED' && res.response?.body.step.status.health == 'SUCCEEDED') {
          recordTestResult({
            testName: testCase.address,
            responseTime: apiResponseTime,
            status: 'FINISHED',
          });
        } else {
          recordTestResult({
            testName: testCase.address,
            responseTime: apiResponseTime,
            status: 'FAILED',
          });
        }
      });

      recallDetectionGetById(testCase.address, requestStartTime).then(({ roofSlopeInDegree, roofHeightInMeter }) => {
        cy.contains(`Surface :${testCase.surface} m²`);
        cy.contains(`Hauteur du bâtiment :${roofHeightInMeter} m`);
        cy.contains('Pente (°)').parent('div').find('input').should('have.value', `${roofSlopeInDegree}`);

        const checkShowedValues = new Promise(resolve =>
          testCase.contains.forEach((text, index) => {
            cy.contains(text).parent('div').contains(/\dm²/);
            if (index === testCase.contains.length - 1) resolve(undefined);
          })
        );

        checkShowedValues.then(() => {
          cy.contains(/Note de dégradation globale :/);

          cy.intercept('GET', '/toiture**').as('getLLMRepport');

          cy.contains('Générer un rapport').click();
          cy.wait('@getLLMRepport');
          cy.get('canvas').should('not.exist');
          cy.contains('COMPRENDRE VOTRE RAPPORT', { timeout: 10000 });
          cy.contains('CONSEILS DE L’ARTISAN COUVREUR', { timeout: 10000 });
        });
      });

      cy.intercept('POST', '/accounts/**/annotations/exports').as('exportPDF');
      cy.contains("Exporter l'analyse en PDF").click();

      cy.wait('@exportPDF', { timeout: 60000 }).then(({ response }) => {
        expect(response.statusCode).to.be.equal(200);
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

  const RESPONSE_TIME_THRESHOLD = 60000;

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
              name: '[Cypress Error] Failed to process roof detection',
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
              name: '[ROOF DETECTION] Failed to process detection',
              message: `Failed to process roof detection on : ${failedTests}`,
              status: 'INVESTIGATING',
              componentStatus: 'MAJOROUTAGE',
            });
          } else if (incidentId && incidentStatus != 'INVESTIGATING') {
            return cy.task('updateInstatusIncident', {
              incidentId,
              message: `Failed to process roof detection on : ${failedTests}`,
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
              message: `Detection took too much time on : ${slowTests}`,
              status: 'MONITORING',
              componentStatus: 'PARTIALOUTAGE',
            });
          } else if (!incidentId) {
            return cy.task('createInstatusIncident', {
              name: '[ROOF DETECTION] Slow detection',
              message: `Detection took too much time on : ${slowTests}`,
              status: 'MONITORING',
              componentStatus: 'PARTIALOUTAGE',
            });
          }
        } else {
          if (incidentId) {
            return cy.task('resolveInstatusIncident', { incidentId, message: 'Roof detection succeeded' });
          }
        }
      });
    });
  });
});
