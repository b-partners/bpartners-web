import {
  createLyonAnnotation,
  createParthenayAnnotationDetection,
  cypressTestResult,
  pdfResults,
  recordCypressTestResult,
  recordPDFResult,
  recordTestResult,
  testResults,
} from '../../../cypress/support/instatus-helper';
import { recallDetectionGetById } from './awaitAsyncProcess.it.cy';

const INSTATUS_DETECTION_COMPONENT_ID = process.env.INSTATUS_DETECTION_COMPONENT_ID;
const INSTATUS_PDF_COMPONENT_ID = process.env.INSTATUS_PDF_COMPONENT_ID;
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

const logIncident = (incident: any) => {
  cy.log('Incident ID', incident?.id ?? null);
  cy.log('Incident Status', incident?.status ?? null);
};

const handleIncident = ({ incident, componentId, createPayload, updatePayload, resolveMessage }: any) => {
  const incidentId = incident?.id ?? null;
  const incidentStatus = incident?.status ?? null;

  logIncident(incident);

  if (createPayload && !incidentId) {
    return cy.task('createInstatusIncident', createPayload);
  }

  if (updatePayload && incidentId && incidentStatus !== updatePayload.status) {
    return cy.task('updateInstatusIncident', {
      componentId,
      incidentId,
      ...updatePayload,
    });
  }

  if (resolveMessage && incidentId) {
    return cy.task('resolveInstatusIncident', {
      componentId,
      incidentId,
      message: resolveMessage,
    });
  }
};

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

        testCase.contains.forEach(text => {
          cy.contains(text).parent('div').contains(/\dm²/);
        });

        cy.contains(/Note de dégradation globale :/);
        cy.intercept('GET', '/toiture**').as('getLLMRepport');
        cy.contains('Générer un rapport').click();
        cy.wait('@getLLMRepport');
        cy.get('canvas').should('not.exist');
        cy.contains('COMPRENDRE VOTRE RAPPORT', { timeout: 10000 });
        cy.contains('CONSEILS DE L’ARTISAN COUVREUR', { timeout: 10000 });
      });

      cy.intercept('POST', '/accounts/**/annotations/exports').as('exportPDF');
      cy.contains("Exporter l'analyse en PDF").click();

      cy.wait('@exportPDF', { timeout: 60000 }).then(({ response }) => {
        if (response.statusCode == 200) {
          recordPDFResult({ status: 'SUCCEEDED' });
        } else {
          recordPDFResult({ status: 'FAILED' });
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

  const RESPONSE_TIME_THRESHOLD = 100000;

  after(() => {
    cy.then(() => {
      const hasFailed = testResults.some(r => r.status === 'FAILED');
      const isSlow = testResults.some(r => r.responseTime > RESPONSE_TIME_THRESHOLD);
      const hasCypressTestFailed = cypressTestResult.some(r => r.status === 'FAILED');
      const hasPDFGenerationFailed = pdfResults.some(r => r.status === 'FAILED');

      cy.log(`PDF Generation results = ${JSON.stringify(pdfResults, null, 2)}`);

      // PDF MONITORING
      cy.task('getOpenInstatusIncident', { componentId: INSTATUS_PDF_COMPONENT_ID }).then((incident: any) => {
        const pdfIncidentId = incident?.id ?? null;
        cy.log('hasPDFGenerationFailed' + hasPDFGenerationFailed);
        cy.log('incidentId=' + pdfIncidentId);

        if ((hasPDFGenerationFailed || hasFailed) && !pdfIncidentId) {
          const message = hasFailed ? 'Error occurred during detection' : 'Error occurred during pdf generation';
          const componentStatus = hasFailed ? 'PARTIALOUTAGE' : 'MAJOROUTAGE';
          const status = hasFailed ? 'MONITORING' : 'INVESTIGATING';
          return handleIncident({
            incident,
            componentId: INSTATUS_PDF_COMPONENT_ID,
            createPayload: {
              componentId: INSTATUS_PDF_COMPONENT_ID,
              name: '[PDF GENERATION] failed to generate PDF',
              message: message,
              status: status,
              componentStatus: componentStatus,
            },
          });
        }

        if (hasCypressTestFailed && !pdfIncidentId) {
          return handleIncident({
            incident,
            componentId: INSTATUS_PDF_COMPONENT_ID,
            createPayload: {
              componentId: INSTATUS_PDF_COMPONENT_ID,
              name: '[PDF GENERATION] Cypress error',
              message: 'Cypress error occured',
              status: 'IDENTIFIED',
              componentStatus: 'DEGRADEDPERFORMANCE',
            },
          });
        }

        return handleIncident({
          incident,
          componentId: INSTATUS_PDF_COMPONENT_ID,
          resolveMessage: 'PDF Generation succeeded',
        });
      });

      // DETECTION MONITORING
      cy.log(`TestResults = ${JSON.stringify(testResults, null, 2)}`);
      cy.log(`CypressTestResults = ${JSON.stringify(cypressTestResult, null, 2)}`);

      cy.task('getOpenInstatusIncident', { componentId: INSTATUS_DETECTION_COMPONENT_ID }).then((incident: any) => {
        const failedApiTests = testResults
          .filter(r => r.status === 'FAILED')
          .map(r => `${r.testName} (${r.responseTime}ms)`)
          .join(', ');

        const failedCypressTests = cypressTestResult
          .filter(r => r.status === 'FAILED')
          .map(r => `${r.testName} (${r.error})`)
          .join(', ');

        const slowTests = testResults
          .filter(r => r.responseTime > RESPONSE_TIME_THRESHOLD)
          .map(r => `${r.testName} (${r.responseTime}ms)`)
          .join(', ');

        if (hasCypressTestFailed) {
          return handleIncident({
            incident,
            componentId: INSTATUS_DETECTION_COMPONENT_ID,
            createPayload: {
              componentId: INSTATUS_DETECTION_COMPONENT_ID,
              name: '[Cypress Error] Failed to process roof detection',
              message: `Cypress test failed: ${failedCypressTests}`,
              status: 'IDENTIFIED',
              componentStatus: 'DEGRADEDPERFORMANCE',
            },
            updatePayload: {
              message: `Cypress test failed: ${failedCypressTests}`,
              status: 'IDENTIFIED',
              componentStatus: 'DEGRADEDPERFORMANCE',
            },
          });
        }

        if (hasFailed) {
          return handleIncident({
            incident,
            componentId: INSTATUS_DETECTION_COMPONENT_ID,
            createPayload: {
              componentId: INSTATUS_DETECTION_COMPONENT_ID,
              name: '[ROOF DETECTION] Failed to process detection',
              message: `Failed on: ${failedApiTests}`,
              status: 'INVESTIGATING',
              componentStatus: 'MAJOROUTAGE',
            },
            updatePayload: {
              message: `Failed on: ${failedApiTests}`,
              status: 'INVESTIGATING',
              componentStatus: 'MAJOROUTAGE',
            },
          });
        }

        if (isSlow) {
          return handleIncident({
            incident,
            componentId: INSTATUS_DETECTION_COMPONENT_ID,
            createPayload: {
              componentId: INSTATUS_DETECTION_COMPONENT_ID,
              name: '[ROOF DETECTION] Slow detection',
              message: `Slow on: ${slowTests}`,
              status: 'MONITORING',
              componentStatus: 'PARTIALOUTAGE',
            },
            updatePayload: {
              message: `Slow on: ${slowTests}`,
              status: 'MONITORING',
              componentStatus: 'PARTIALOUTAGE',
            },
          });
        }

        return handleIncident({
          incident,
          componentId: INSTATUS_DETECTION_COMPONENT_ID,
          resolveMessage: 'Roof detection succeeded',
        });
      });
    });
  });
});
