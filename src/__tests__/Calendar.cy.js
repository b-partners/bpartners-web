import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import * as Redirect from '../common/utils';

const calendarTokenNotValid = () => {
  cy.intercept('GET', '/users/mock-user-id1/calendars', req => req.reply({ statusCode: 403 }));
  cy.intercept('POST', '/users/mock-user-id1/calendars/oauth2/consent', req =>
    req.reply({
      statusCode: 200,
      body: {
        redirectionStatusUrls: {
          successUrl: 'dummy',
          failureUrl: 'dummy',
        },
      },
    })
  );
  mount(<App />);
  cy.get("[name='calendar']").click();
  cy.contains('Me synchroniser avec mon agenda google');
  cy.get("[data-testid='button-sync-to-google-calendar']").click();
  cy.get('@redirect').should('have.been.calledOnce');
};

const calendar = () => {
  cy.intercept('GET', '/users/mock-user-id1/calendars', [{ summary: 'holydays', id: 'holydays-calendar-id', permission: 'READER' }]);
  cy.intercept('GET', '/users/mock-user-id1/calendars/holydays-calendar-id/events**', [
    {
      summary: 'Event for today',
      organizer: 'Me',
      location: 'Antananarivo',
      from: new Date(),
      id: 'today-event-id',
      to: new Date(new Date().getTime() + 60 * 1000),
      participants: ['participants', 'participants'],
      updatedAt: new Date(),
    },
  ]);

  mount(<App />);
  cy.get("[name='calendar']").click();
  cy.contains("Aujourd'hui");
  cy.contains('Mois');
  cy.contains('Semaine');
  cy.contains('Jour');
};

describe(specTitle('Calendar'), () => {
  beforeEach(() => {
    cy.cognitoLogin();
    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('Calendar when token is not valid', calendarTokenNotValid);
  it('Should test calendar', calendar);
});
