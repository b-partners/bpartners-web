import App from '@/App';
import { useDialog } from '@/common/store/dialog';
import { accountHolders1, accounts1, businessActivities, creditPacks, emptyCreditBalance } from './mocks/responses';
import { whoami1 } from './mocks/responses/security-api';

const CREDITS_REQUIRED_MODAL_TITLE = 'Crédits d’analyses insuffisants';
const GET_IMAGE_DIALOG_TITLE = "Renseignez l'adresse de votre prospect";
const ADDRESS = '753 Routes de Saint Lyphard';

describe('Credit requirement', () => {
  beforeEach(() => {
    useDialog.getState().close();
    cy.cognitoLogin();
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccounts');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder');
    cy.intercept('GET', '/businessActivities?page=1&pageSize=100', businessActivities).as('getBusinessActivities');
    cy.intercept('GET', '/accounts/**/annotations/drafts?page=*&pageSize=*', []).as('getDrafts');
    cy.intercept('GET', `/users/${whoami1.user.id}/creditBalance`, emptyCreditBalance).as('getCreditBalance');
    cy.intercept('GET', '**/creditPacks*', creditPacks).as('getCreditPacks');
  });

  it('blocks passing to analyse and offers the credit packs when the balance is empty', () => {
    cy.mount(<App />);
    cy.wait('@getAccountHolder');

    cy.getByName('home').click();
    cy.dataCy('add-address').click().type(ADDRESS);
    cy.dataCy('button-analyze').click();
    cy.wait('@getCreditBalance');

    cy.contains(CREDITS_REQUIRED_MODAL_TITLE);
    cy.contains(GET_IMAGE_DIALOG_TITLE).should('not.exist');

    cy.wait('@getCreditPacks');
    cy.contains('100 crédits, soit environ 10 analyses.');
  });

  it('closes the modal and goes back home when the credits are not bought now', () => {
    cy.mount(<App />);
    cy.wait('@getAccountHolder');

    cy.getByName('home').click();
    cy.dataCy('add-address').click().type(ADDRESS);
    cy.dataCy('button-analyze').click();
    cy.contains(CREDITS_REQUIRED_MODAL_TITLE);

    cy.getByName('credits-required-not-now').click();

    cy.contains(CREDITS_REQUIRED_MODAL_TITLE).should('not.exist');
    cy.contains(GET_IMAGE_DIALOG_TITLE).should('not.exist');
    cy.contains('Bienvenue sur le dashboard de Birdia');
  });
});
