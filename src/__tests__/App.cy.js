import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from '../App';

describe(specTitle('App'), () => {
  it('it renders', () => {
    mount(<App />);
    cy.get('title');
  });
});
