import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import { redirect } from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { calendarEvents, calendars } from './mocks/responses/calendar-api';
import { whoami1 } from './mocks/responses/security-api';

describe(specTitle('Calendar'), () => {
  beforeEach(() => {
    cy.cognitoLogin();
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    const carreleurs = [{ ...accountHolders1[0], businessActivities: { primary: 'Carreleur' } }];
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, carreleurs).as('getAccountHolder1');

    cy.stub({ redirect }, 'redirect').as('redirect');
    cy.window().then(win => {
      cy.stub(win, 'open').as('windowOpen');
    });
  });

  it('Should sync calendar [Page]', () => {
    const now = new Date('2023-01-01');
    // set date global date 2023-01-01
    cy.clock(now);
    cy.intercept('GET', '/users/mock-user-id1/calendars', []);
    cy.intercept('PUT', '/users/mock-user-id1/calendars/holydays-calendar-id/events', req => req.reply({ statusCode: 403 })).as('editCalendarEvent');
    cy.intercept('POST', '/users/mock-user-id1/calendars/oauth2/consent', { redirectionUrl: '/dummy' }).as('consent');

    cy.mount(<App />);
    cy.get("[name='calendar']").click();
    cy.contains(
      "Il semble que c'est la première fois que vous utilisez BPartners, veuillez synchroniser votre agenda pour obtenir de nouveaux prospects à proximité de vos prochains RDV."
    );
    cy.contains('vous acceptez que BPartners transmette anonymement vos informations');
    cy.contains('https://legal.bpartners.app/').click();
    cy.get('@windowOpen').should('be.calledOnce');
    cy.get('@windowOpen').invoke('getCall', 0).should('have.been.calledWithMatch', 'https://legal.bpartners.app');

    cy.contains('Connecter le calendrier Google').should('be.disabled');
    cy.get('[data-testid="control-cgs"]').click();
    cy.contains('Connecter le calendrier Google').click();
    cy.get('@redirect').should('have.been.calledOnce');

    cy.intercept('GET', '/users/mock-user-id1/calendars', calendars);
  });

  it('Should sync calendar [Dialog]', () => {
    const now = new Date('2023-01-01');
    // set date global date 2023-01-01
    cy.clock(now);
    cy.intercept('GET', '/users/mock-user-id1/calendars', calendars);
    cy.intercept('PUT', '/users/mock-user-id1/calendars/holydays-calendar-id/events', req => req.reply({ statusCode: 403 })).as('editCalendarEvent');
    cy.intercept('POST', '/users/mock-user-id1/calendars/oauth2/consent', { redirectionUrl: '/dummy' }).as('consent');

    cy.mount(<App />);
    cy.get("[name='calendar']").click();
    cy.contains(
      'Votre session Google Agenda a expiré, veuillez synchroniser votre agenda pour obtenir de nouveaux prospects à proximité de vos prochains RDV.'
    );
    cy.contains('Pas maintenant').click();
    cy.contains(
      "Il semble que c'est la première fois que vous utilisez BPartners, veuillez synchroniser votre agenda pour obtenir de nouveaux prospects à proximité de vos prochains RDV."
    );
    cy.contains('vous acceptez que BPartners transmette anonymement vos informations');
    cy.contains('https://legal.bpartners.app/').click();
    cy.get('@windowOpen').should('be.calledOnce');
    cy.get('@windowOpen').invoke('getCall', 0).should('have.been.calledWithMatch', 'https://legal.bpartners.app');

    cy.contains('Connecter le calendrier Google').should('be.disabled');
    cy.get('[data-testid="control-cgs"]').click();
    cy.contains('Connecter le calendrier Google').click();
    cy.get('@redirect').should('have.been.calledOnce');
  });

  it('Should test calendar', () => {
    const now = new Date('2023-01-01');
    // set date global date 2023-01-01
    cy.clock(now);
    cy.intercept('GET', '/users/mock-user-id1/calendars', calendars).as('getAllCalendars');
    cy.intercept('GET', '/users/mock-user-id1/calendars/holydays-calendar-id/events**', calendarEvents).as('getAllCalendarEvents');

    cy.mount(<App />);
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

    cy.intercept('PUT', '/accountHolders/mock-accountHolder-id1/prospects/evaluationJobs', []).as('transformEventToProspects');

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
    cy.get("[data-testid='autocomplete-backend-for-participants'] input").type('john doe{Enter}');
    cy.contains('Email non valide');
    cy.get("[data-testid='autocomplete-backend-for-participants'] input")
      .clear()
      .type(participantMock + '{Enter}');

    // submit
    const newEvent = { ...calendarEvents[0], summary: titleMock, participants: participantMock, from: startDateMock, to: endDateMock };
    cy.intercept('GET', '/users/mock-user-id1/calendars/holydays-calendar-id/events**', [newEvent]).as('getNewCalendarEvent');
    cy.get('[data-testid="save-calendar-event"]').click();
    cy.wait('@transformEventToProspects').then(interception => {
      const responseStatus = interception.response.statusCode;
      expect(responseStatus).to.equal(200);
    });
    cy.contains(titleMock);
    //restore the current date
    cy.clock().invoke('restore');
  });
});
