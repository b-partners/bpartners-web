import specTitle from 'cypress-sonarqube-reporter/specTitle';
import { HorizontalPagination } from '@/common/components/HorizontalPagination';

describe(specTitle('Pagination test'), () => {
  it('should test next button', () => {
    let activeStep = 1;
    cy.mount(<HorizontalPagination activeStep={activeStep} maxSteps={10} setActiveStep={a => expect(a(activeStep)).to.eq(2)} />);

    cy.contains(1);
    cy.contains(10);

    cy.get("[data-test-item='pdf-next']").click();
  });
  it('should test prev button', () => {
    let activeStep = 3;
    cy.mount(<HorizontalPagination activeStep={activeStep} maxSteps={10} setActiveStep={a => expect(a(activeStep)).to.eq(2)} />);

    cy.contains(3);
    cy.contains(10);

    cy.get("[data-test-item='pdf-prev']").click();
  });
});
