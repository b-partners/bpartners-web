export const recallAsyncProcess = (requestStartTime: number) => {
    cy.wait('@3DConvertion', { timeout: 50000 }).then((interception) => {
        const processStatus = interception.response?.body?.status;

        if (processStatus === 'FINISHED') {
        const apiResponseTime = Date.now() - requestStartTime;
        cy.log(`🌐 API Response TIME (3D Conversion): ${apiResponseTime} ms`);
        expect(apiResponseTime).to.be.lessThan(130000)
        return
        }

        if (processStatus === 'UNAVAILABLE') {
        const apiResponseTime = Date.now() - requestStartTime;
        cy.log(`3D Conversion unavailable - Response TIME: ${apiResponseTime} ms`);
        cy.get('[data-testid="3D-error-alert"]').should('be.visible')
        expect(apiResponseTime).to.be.lessThan(120000)
        return
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