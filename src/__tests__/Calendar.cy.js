import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import * as Redirect from '../common/utils';
import { calendarEvents, calendars } from './mocks/responses/calendar-api';

describe(specTitle('Calendar'), () => {
  beforeEach(() => {
    cy.cognitoLogin();
    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('Should test calendar', () => {
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

    // edit the event
    const participantMock = 'john@gmail.com';
    const titleMock = "New event's name.";
    const startDateMock = '2023-01-01T10:00';
    const endDateMock = '2023-01-01T10:30';
    cy.intercept('PUT', '/users/mock-user-id1/calendars/holydays-calendar-id/events', req => {
      const {
        body: [body],
      } = req;
      expect(body.summary).eq(titleMock);
      expect(body.participants).deep.equal([participantMock]);

      req.reply({ body: [body] });
    }).as('editCalendarEvent');

    cy.contains('Event for today').click();
    cy.contains('Édition');
    // change the event's name
    cy.get("[name='title']").clear().type(titleMock);
    cy.get("[name='start']").invoke('removeAttr').clear().type(startDateMock);
    cy.get("[name='end']").invoke('removeAttr').clear().type(endDateMock);
    cy.get("[name='location']").clear().type('New location');

    // remove old participant
    cy.get(':nth-child(1) > [data-testid="CancelIcon"]').click();
    cy.get(':nth-child(1) > [data-testid="CancelIcon"]').click();

    // test participants multiple input
    cy.get("[name='participants']").type('participant');
    cy.contains('Ajouter').click();
    cy.contains('Email non valide');
    cy.get("[name='participants']").clear().type(participantMock);
    cy.contains('Ajouter').click();

    // submit
    cy.get('[data-testid="save-calendar-event"]').click();
    const newEvent = { ...calendarEvents[0], summary: titleMock, participants: participantMock, from: startDateMock, to: endDateMock };
    cy.intercept('GET', '/users/mock-user-id1/calendars/holydays-calendar-id/events**', [newEvent]).as('getNewCalendarEvent');
    cy.wait('@getNewCalendarEvent');
    cy.contains(titleMock);
    //restore the current date
    cy.clock().invoke('restore');
  });
});
