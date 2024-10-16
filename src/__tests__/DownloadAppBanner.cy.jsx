import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from '@/App';

describe(specTitle('download app banner'), { viewportWidth: 1000 }, () => {
  it('show download app banner below 1000px', () => {
    cy.mount(<App />);
    cy.contains('Pour plus de confort, télécharger notre application mobile !');
    cy.get('#login').should('not.exist');
  });
});
