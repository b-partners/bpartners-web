import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';

describe(specTitle(''), { viewportWidth: 1000 }, () => {
  it('show download app banner below 1000px', () => {
    mount(<App />);
    cy.contains('Pour plus de confort, télécharger notre application mobile !');
    cy.get('#login').should('not.exist');
  });
});
