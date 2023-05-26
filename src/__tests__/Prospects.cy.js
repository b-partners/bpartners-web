import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import * as Redirect from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { prospects } from './mocks/responses/prospects-api';
import { whoami1 } from './mocks/responses/security-api';

describe(specTitle('Customers'), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    const carreleurs = [{ ...accountHolders1[0], businessActivities: { primary: 'Carreleur' } }];
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, carreleurs).as('getAccountHolder1');

    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('are displayed', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, prospects).as('getProspects');
    cy.intercept('PUT', `/accountHolders/${accountHolders1[0].id}/prospects`, req => {
      expect(req.body[0].status).deep.eq('CONTACTED');

      req.reply(req.body);
    }).as('updateStatus');
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();

    cy.wait('@getProspects');

    cy.contains('À contacter');
    cy.contains('Contactés');
    cy.contains('Convertis');

    cy.contains(/John Doe/gi);
    cy.contains('johnDoe@gmail.com');
    cy.contains('+261340465338');
    cy.contains('30 Rue de la Montagne Sainte-Genevieve');
    cy.contains('21547');

    cy.get('[data-testid="statusprospect1_id"]').click();
    cy.get('.MuiFormGroup-root > :nth-child(2) > .MuiTypography-root').click();

    cy.wait('@updateStatus');

    cy.contains('Changement effectué');

    cy.contains('Non renseigné');
  });

  it('change prospecting perimeter', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, []).as('getProspects1');
    cy.intercept('PUT', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders/${accountHolders1[0].id}/globalInfo`, req => {
      expect(req.body.contactAddress.prospectingPerimeter).to.deep.eq(5);

      req.reply(accountHolders1[0]);
    }).as('updateProspectingPerimeter');

    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();
    cy.get('.MuiTabs-flexContainer > [tabindex="-1"]').click();

    cy.contains('Configurer le périmètre de prospection.');
    cy.contains('0 km');
    cy.contains('4');
    cy.contains('10 km');

    cy.get('[data-testid="perimeterSlider"]').invoke('val', 5).trigger('change').click({ force: true });

    cy.contains('5');

    cy.wait('@updateProspectingPerimeter');

    cy.contains('Changement enregistré');
  });

  it('should show empty list', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, []).as('getProspects1');
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();

    cy.contains('Aucun enregistrement à afficher');
  });
});
