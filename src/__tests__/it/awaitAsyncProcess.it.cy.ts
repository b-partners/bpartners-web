import { recordTestResult } from '../../../cypress/support/instatus-helper';

export const recallAsyncProcess = (address: string, requestStartTime: number): Cypress.Chainable<number> => {
  return cy.wait('@3DConvertion', { timeout: 50000 }).then(interception => {
    const processStatus = interception.response?.body?.status;

    if (processStatus === 'FINISHED') {
      const apiResponseTime = Date.now() - requestStartTime;
      recordTestResult({
        testName: address,
        responseTime: apiResponseTime,
        status: 'FINISHED',
      });
      return cy.wrap(apiResponseTime);
    }

    if (processStatus === 'UNAVAILABLE') {
      const apiResponseTime = Date.now() - requestStartTime;
      cy.get('[data-testid="3D-error-alert"]').should('be.visible');
      recordTestResult({
        testName: address,
        responseTime: apiResponseTime,
        status: 'UNAVAILABLE',
      });
      return cy.wrap(apiResponseTime);
    }

    if (processStatus === 'FAILED') {
      const apiResponseTime = Date.now() - requestStartTime;
      cy.get('[data-testid="3D-error-alert"]').should('be.visible');
      recordTestResult({
        testName: address,
        responseTime: apiResponseTime,
        status: 'FAILED',
      });
    }

    cy.log(`Status still ${processStatus}, recalling...`);
    return recallAsyncProcess(address, requestStartTime);
  });
};
