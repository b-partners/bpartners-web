import App from '@/App';
import { accountHolders1, accounts1, whoami1 } from './mocks/responses';

describe('Home', () => {
  beforeEach(() => {
    cy.cognitoLogin();
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    const carreleurs = [{ ...accountHolders1[0], businessActivities: { primary: 'Couvreur' } }];
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, carreleurs).as('getAccountHolder1');
    cy.mount(<App />);
    cy.getByName('home').click();
  });

  it.only('Text displayed on the home page', () => {
    cy.contains('');
  });

  it('open create prospect modal', () => {
    cy.getByTestId('create-prospect-button').click();
    cy.contains("Renseignez l'adresse de votre prospect ou votre client et analysez les images haute résolution de sa toiture.");
  });
});
