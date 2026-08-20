import App from '@/App';
import { useDialog } from '@/common/store/dialog';
import { AccountHolder } from '@bpartners/typescript-client';
import { account1, accountHolder1, accounts1, businessActivities } from './mocks/responses/account-api';
import { creditBalance } from './mocks/responses/credits-api';
import { whoami1 } from './mocks/responses/security-api';

const SIREN_MODAL_TITLE = 'Insérer votre SIREN pour effectuer des analyses';
const GET_IMAGE_DIALOG_TITLE = "Renseignez l'adresse de votre prospect";
const NEW_SIREN = '123456789';

const clone = (accountHolder: AccountHolder): AccountHolder => JSON.parse(JSON.stringify(accountHolder));

describe('Siren', () => {
  let currentAccountHolder: AccountHolder;

  const interceptAccountHolder = () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${account1.id}/accountHolders`, req => req.reply([currentAccountHolder])).as('getAccountHolder');
  };

  const interceptCompanyUpdates = () => {
    cy.intercept('PUT', `/users/${whoami1.user.id}/accounts/${account1.id}/accountHolders/${accountHolder1.id}/businessActivities`, req =>
      req.reply(currentAccountHolder)
    ).as('updateBusinessActivities');
    cy.intercept('PUT', `/users/${whoami1.user.id}/accounts/${account1.id}/accountHolders/${accountHolder1.id}/companyInfo`, req =>
      req.reply(currentAccountHolder)
    ).as('updateCompanyInfo');
    cy.intercept('PUT', `/users/${whoami1.user.id}/accountHolders/${accountHolder1.id}/feedback/configuration`, req => req.reply(currentAccountHolder)).as(
      'updateFeedback'
    );
    cy.intercept('PUT', `/users/${whoami1.user.id}/accounts/${account1.id}/accountHolders/${accountHolder1.id}/globalInfo`, req => {
      expect(req.body.siren).to.eq(NEW_SIREN);
      currentAccountHolder = { ...currentAccountHolder, siren: req.body.siren };
      req.reply(currentAccountHolder);
    }).as('updateGlobalInfo');
  };

  beforeEach(() => {
    currentAccountHolder = { ...clone(accountHolder1), siren: null };
    useDialog.getState().close();
    cy.cognitoLogin();
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccounts');
    cy.intercept('GET', '/accounts/**/annotations/drafts?page=*&pageSize=*', []).as('getDrafts');
    cy.intercept('GET', '/businessActivities?page=1&pageSize=100', businessActivities).as('getBusinessActivities');
    cy.intercept('GET', `/users/${whoami1.user.id}/creditBalance`, creditBalance).as('getCreditBalance');
    interceptAccountHolder();
  });

  it('asks for the siren right after login when it is missing', () => {
    cy.mount(<App />);
    cy.wait('@getAccountHolder');

    cy.contains(SIREN_MODAL_TITLE);
    cy.getByTestId('siren-field-input').should('be.visible');
  });

  it('does not ask for the siren after login when it is already set', () => {
    currentAccountHolder = { ...clone(accountHolder1), siren: NEW_SIREN };

    cy.mount(<App />);
    cy.wait('@getAccountHolder');
    cy.getByName('home').click();

    cy.contains('Bienvenue sur le dashboard de Birdia');
    cy.contains(SIREN_MODAL_TITLE).should('not.exist');
  });

  it('asks for the siren again when passing to analyse without it', () => {
    cy.mount(<App />);
    cy.wait('@getAccountHolder');

    cy.contains(SIREN_MODAL_TITLE);
    cy.getByTestId('siren-later-btn').click();
    cy.contains(SIREN_MODAL_TITLE).should('not.exist');

    cy.getByName('home').click();
    cy.dataCy('add-address').click().type('753 Routes de Saint Lyphard');
    cy.dataCy('button-analyze').click();

    cy.contains(SIREN_MODAL_TITLE);
    cy.contains(GET_IMAGE_DIALOG_TITLE).should('not.exist');
  });

  it('rejects a siren that is not made of nine digits', () => {
    cy.mount(<App />);
    cy.wait('@getAccountHolder');

    cy.contains(SIREN_MODAL_TITLE);
    cy.getByTestId('siren-field-input').type('12345');
    cy.getByTestId('siren-submit-btn').click();

    cy.contains('Le SIREN doit être composé de 9 chiffres.');
    cy.contains(SIREN_MODAL_TITLE);
  });

  it('passes to analyse once the siren has been saved from the modal', () => {
    interceptCompanyUpdates();

    cy.mount(<App />);
    cy.wait('@getAccountHolder');

    cy.contains(SIREN_MODAL_TITLE);
    cy.getByTestId('siren-field-input').type(NEW_SIREN);
    cy.getByTestId('siren-submit-btn').click();
    cy.wait('@updateGlobalInfo');

    cy.contains(SIREN_MODAL_TITLE).should('not.exist');
    cy.contains(GET_IMAGE_DIALOG_TITLE).should('not.exist');

    cy.getByName('home').click();
    cy.dataCy('add-address').click().type('753 Routes de Saint Lyphard');
    cy.dataCy('button-analyze').click();

    cy.contains(GET_IMAGE_DIALOG_TITLE);
    cy.contains(SIREN_MODAL_TITLE).should('not.exist');
  });

  it('stops asking for the siren once it has been saved from the account page', () => {
    interceptCompanyUpdates();

    cy.mount(<App />);
    cy.wait('@getAccountHolder');

    cy.contains(SIREN_MODAL_TITLE);
    cy.getByTestId('siren-later-btn').click();

    cy.getByName('account').click();
    cy.contains('Ma société');
    cy.dataCy('edit-mode-button').click();

    cy.name('siren').clear().type(NEW_SIREN);
    cy.name('feedback.feedbackLink').clear().type('https://birdia.fr');
    cy.name('contactAddress.postalCode').clear().type('44000');
    cy.name('companyInfo.phone').clear().type('+261345656756');
    cy.dataCy('save-profile').click();
    cy.wait('@updateGlobalInfo');

    cy.getByName('home').click();
    cy.dataCy('add-address').click().type('753 Routes de Saint Lyphard');
    cy.dataCy('button-analyze').click();

    cy.contains(GET_IMAGE_DIALOG_TITLE);
    cy.contains(SIREN_MODAL_TITLE).should('not.exist');
  });
});
