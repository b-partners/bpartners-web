import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import * as Redirect from '../common/utils';
import { calendarEvents, calendars } from './mocks/responses/calendar-api';

const calendar = () => {
  const now = new Date('2023-01-01');
  // set date global date 2023-01-01
  cy.clock(now);
  cy.intercept('GET', '/users/mock-user-id1/calendars', calendars);
  cy.intercept('GET', '/users/mock-user-id1/calendars/holydays-calendar-id/events**', calendarEvents);

  mount(<App />);
  cy.get("[name='calendar']").click();
  cy.contains("Aujourd'hui");
  cy.contains('Mois');
  cy.contains('Semaine');
  cy.contains('Jour');
  cy.contains('Event for today');

  //restore the current date
  cy.clock().invoke('restore');
};

describe(specTitle('Calendar'), () => {
  beforeEach(() => {
    cy.cognitoLogin();
    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it.only('Should test calendar', calendar);
});
