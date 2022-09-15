import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

describe(specTitle('Customers'), () => {

  it('are displayed', () => {
    mount(<App />);
    cy.get('[href="/customers"]').click();

    cy.contains('');
  });

});
