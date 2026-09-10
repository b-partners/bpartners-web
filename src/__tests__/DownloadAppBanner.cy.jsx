import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from '@/App';

describe(specTitle('download app banner'), () => {
  it('show download app banner at or below 600px', { viewportWidth: 600 }, () => {
    cy.mount(<App />);
    cy.contains('Pour plus de confort, télécharger notre application mobile !');
    cy.get('#login').should('not.exist');
  });

  it('show login form above 600px', { viewportWidth: 800 }, () => {
    cy.mount(<App />);
    cy.get('#login').should('exist');
    cy.contains('Pour plus de confort, télécharger notre application mobile !').should('not.exist');
  });
});
