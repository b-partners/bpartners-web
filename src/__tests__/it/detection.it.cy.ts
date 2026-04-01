import { createLyonAnnotation, cypressTestResult, recordCypressTestResult, recordTestResult, testResults } from '../../../cypress/support/instatus-helper';
import { recallDetectionGetById } from './awaitAsyncProcess.it.cy';

const testCases = [
  {
    name: 'Generate 3D on 2 Place Bellecour, 69002 Lyon',
    address: '2 Place Bellecour, 69002 Lyon',
    annotation: createLyonAnnotation,
    surface: { min: 294, max: 291 },
    // usure: 'LOW',
    // taux_usure:  {min: 1, max: 2},
    // taux_moisissure: {min: 0, max: 0},
    // taux_humidite:  {min: 0, max: 0},
    // obstacle: 'OUI',
    // revet_1: 'ROOF_TUILES',
    // degradation_globale: 0.48,
    // usure_importante_A: 0.64,
    // MOISISSURE_COULEUR: 'Moisissure Couleur',
    // MOISISSURE_CLAIR: 'Moisissure Clair',
    // MOISISSURE_NOIRCIE: 'Moisissure Noircie',
    // MOISISSURE: 'Moisissure',
    // HUMIDITE_CLAIR: 'Humidite Clair',
    // HUMIDITE_INTENSE: 'Humidite Intense',
    // HUMIDITE: 'Humidite',
    // USURE_LEGER: 'Usure Leger',
    // USURE_IMPORTANTE: 'Usure Importante',
    // USURE: 'Usure',
    // OBSTACLE: 'Obstacle',
    // CHEMINEE: 'Cheminee',
    // VELUX: 'Velux',
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

      recallDetectionGetById(testCase.address).then(({ roofSlopeInDegree, roofHeightInMeter }) => {
        if (roofSlopeInDegree != 0.0 && roofHeightInMeter != 0.0) {
          cy.get('[data-testid="surface"]')
            .invoke('text')
            .then(text => {
              const value = parseFloat(text.replace(/[^0-9.]/g, ''));
              expect(value).to.be.within(testCase.surface.min, testCase.surface.max);
            });
          cy.contains(`Hauteur du bâtiment :${roofHeightInMeter} m`);
          cy.get('[data-testid="pente"]').find('input').should('have.value', `${roofSlopeInDegree}`);
          // cy.get('[data-testid="revet-1"]').find('input').should('have.value', `${testCase.revet_1}`)
          // cy.get('[data-testid="usure"]').find('input').should('have.value', `${testCase.usure}`)
          // cy.get('[data-testid="taux-usure"]')
          // .invoke('text')
          // .then((text) => {
          //   const value = parseFloat(text.replace(/[^0-9.]/g, ''));
          //   expect(value).to.be.within(testCase.taux_usure.min, testCase.taux_usure.max);
          // });
          // cy.get('[data-testid="taux-moisissure"]')
          // .invoke('text')
          // .then((text) => {
          //   const value = parseFloat(text.replace(/[^0-9.]/g, ''));
          //   expect(value).to.be.within(testCase.taux_moisissure.min, testCase.taux_moisissure.max);
          // });
          // cy.get('[data-testid="taux-humidité"]')
          // .invoke('text')
          // .then((text) => {
          //   const value = parseFloat(text.replace(/[^0-9.]/g, ''));
          //   expect(value).to.be.within(testCase.taux_humidite.min, testCase.taux_humidite.max);
          // });
          // cy.get('[data-testid="obstacle-velux-pv"]').find('input').should('have.value', `${testCase.obstacle}`)
          // cy.contains(`Note de dégradation globale : ${testCase.degradation_globale}`)
          // cy.dataCy("usure-importante-a-value").should('have.value', testCase.usure_importante_A)
        }
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
