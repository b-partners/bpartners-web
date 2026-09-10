import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from '@/App';

describe(specTitle('use larger screen banner'), () => {
  it('show use larger screen banner at or below 600px', { viewportWidth: 600 }, () => {
    cy.mount(<App />);
    cy.contains('Profitez pleinement de BIRDIA');
    cy.contains('Retrouvez-nous sur votre ordinateur');
    cy.get('#login').should('not.exist');
  });

  it('show login form above 600px', { viewportWidth: 800 }, () => {
    cy.mount(<App />);
    cy.get('#login').should('exist');
    cy.contains('Profitez pleinement de BIRDIA').should('not.exist');
  });
});
