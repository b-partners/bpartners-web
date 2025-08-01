import App from '@/App';
import { accountHolders1, accounts1, whoami1 } from './mocks/responses';

describe('Home', () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    const carreleurs = [{ ...accountHolders1[0], businessActivities: { primary: 'Couvreur' } }];
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, carreleurs).as('getAccountHolder1');

    cy.intercept('GET', '**/prospects**', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Jean Dupont', address: '12 rue du toit' },
        { id: 2, name: 'Toiture Express', address: '15 avenue Zinc' },
        { id: 3, name: 'SARL Ardoise', address: '23 chemin des tuiles' },
        { id: 4, name: 'Le Couvreur Malin', address: '8 rue du zinc' },
        { id: 5, name: 'TopToiture', address: '17 allée de l’étanchéité' },
        { id: 6, name: 'Couvreur du coin', address: '3 impasse du faîtage' },
      ],
    }).as('getProspects');

    cy.mount(<App />);
    cy.getByName('home').click();
    cy.wait('@getProspects');
  });

  it('displays the list of prospects', () => {
    cy.contains('Jean Dupont');
    cy.contains('12 rue du toit');
    cy.contains('Toiture Express');
    cy.contains('15 avenue Zinc');
    cy.contains('SARL Ardoise');
    cy.contains('23 chemin des tuiles');
    cy.contains('Le Couvreur Malin');
    cy.contains('8 rue du zinc');
    cy.contains('TopToiture');
    cy.contains('17 allée de l’étanchéité');
    cy.contains('Couvreur du coin');
    cy.contains('3 impasse du faîtage');
  });
});
