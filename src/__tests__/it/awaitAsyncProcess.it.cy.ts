export const recallAsyncProcess = (requestStartTime: number): Cypress.Chainable<number> => {
    return cy.wait('@3DConvertion', { timeout: 50000 }).then((interception) => {
        const processStatus = interception.response?.body?.status;

        if (processStatus === 'FINISHED') {
        const apiResponseTime = Date.now() - requestStartTime;
        return cy.wrap(apiResponseTime)
        }

        if (processStatus === 'UNAVAILABLE') {
        const apiResponseTime = Date.now() - requestStartTime;
        cy.get('[data-testid="3D-error-alert"]').should('be.visible')
        return cy.wrap(apiResponseTime)
        }

        if (processStatus === 'FAILED') {
        const apiResponseTime = Date.now() - requestStartTime;
        cy.get('[data-testid="3D-error-alert"]').should('be.visible')
        throw new Error(`Process 3D Failed: ${processStatus} in ${apiResponseTime} ms`);
        }

        cy.log(`Status still ${processStatus}, recalling...`);
        return recallAsyncProcess(requestStartTime);
    });
};