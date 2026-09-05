import App from '@/App';
import { useDialog } from '@/common/store/dialog';
import { AccountHolder, User } from '@bpartners/typescript-client';
import dayjs from 'dayjs';
import { account1, accountHolder1, accounts1, businessActivities } from './mocks/responses/account-api';
import { emptyCreditBalance } from './mocks/responses/credits-api';
import { visaPaymentMethods } from './mocks/responses/payment-method-api';
import { user1, whoami1 } from './mocks/responses/security-api';
import { subscriptionPlans } from './mocks/responses/subscription-plans-api';

const SUBSCRIPTION_MODAL_TITLE = "Choisissez l'offre qui vous correspond le mieux.";
const BUSINESS_MODAL_TITLE = 'Veuillez renseigner votre activité';
const ACCOUNT_HOLDER_LOADER_MESSAGE = 'Chargement des données de votre compte...';
const NEW_PRIMARY_ACTIVITY = 'Barbier';

/* a CANCELLED subscription is the state where both requirements collide: it blocks the access as long as no
 payment method is registered, while authProvider.isSubscribed() still lets the account holder be fetched */
const expiredSubscriptionUser: User = {
  ...user1,
  subscription: { status: 'CANCELLED', start: new Date('2025-01-01T00:00:00Z'), end: dayjs().subtract(1, 'day').toDate() },
};
const activeSubscriptionUser: User = { ...user1, subscription: { status: 'ACTIVE' } };

const withoutBusinessActivities = (): AccountHolder => ({ ...accountHolder1, businessActivities: { primary: null, secondary: null } });

const ACCOUNT_HOLDER_URL = `/users/${whoami1.user.id}/accounts/${account1.id}/accountHolders`;
const BUSINESS_ACTIVITIES_URL = `${ACCOUNT_HOLDER_URL}/${accountHolder1.id}/businessActivities`;

describe('Subscription modal priority over the business activity modal', () => {
  let currentAccountHolder: AccountHolder;

  const loginWith = (user: User) => cy.cognitoLogin({ whoami: { user }, user });

  const interceptAccountHolder = (delay = 0) => {
    cy.intercept('GET', ACCOUNT_HOLDER_URL, req => req.reply({ body: [currentAccountHolder], delay })).as('getAccountHolder');
  };

  beforeEach(() => {
    currentAccountHolder = withoutBusinessActivities();
    useDialog.getState().close();
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccounts');
    cy.intercept('GET', '/businessActivities?page=1&pageSize=100', businessActivities).as('getBusinessActivities');
    cy.intercept('GET', '/accounts/**/annotations/drafts?page=*&pageSize=*', []).as('getDrafts');
    cy.intercept('GET', `/users/${whoami1.user.id}/creditBalance`, emptyCreditBalance).as('getCreditBalance');
    cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
    cy.intercept('GET', '**/paymentMethods*', []).as('getPaymentMethods');
  });

  it('shows the blocking subscription plans instead of the business activity modal when no payment method is registered', () => {
    loginWith(expiredSubscriptionUser);
    interceptAccountHolder();

    cy.mount(<App />);
    cy.wait('@getSubscriptionPlans');
    cy.wait('@getAccountHolder');

    cy.contains(SUBSCRIPTION_MODAL_TITLE).should('be.visible');
    cy.contains(BUSINESS_MODAL_TITLE).should('not.exist');
    cy.contains('button', 'Ajouter une carte').should('be.visible');
    cy.contains('button', 'Plus tard').should('not.exist');
  });

  it('keeps the subscription plans rendered while the account holder is still loading', () => {
    loginWith(expiredSubscriptionUser);
    interceptAccountHolder(4000);

    cy.mount(<App />);
    cy.wait('@getSubscriptionPlans');

    cy.contains(ACCOUNT_HOLDER_LOADER_MESSAGE).should('be.visible');
    cy.contains(SUBSCRIPTION_MODAL_TITLE).should('be.visible');
    cy.contains(BUSINESS_MODAL_TITLE).should('not.exist');
  });

  it('asks for the business activity only once the subscription modal has been closed', () => {
    cy.intercept('GET', '**/paymentMethods*', visaPaymentMethods).as('getPaymentMethods');
    loginWith(expiredSubscriptionUser);
    interceptAccountHolder();

    cy.mount(<App />);
    cy.wait('@getSubscriptionPlans');
    cy.wait('@getPaymentMethods');

    cy.contains(SUBSCRIPTION_MODAL_TITLE).should('be.visible');
    cy.contains(BUSINESS_MODAL_TITLE).should('not.exist');

    cy.contains('button', 'Accéder à la plateforme').click();

    cy.contains(BUSINESS_MODAL_TITLE).should('be.visible');
    cy.contains(SUBSCRIPTION_MODAL_TITLE).should('not.exist');
  });

  it('asks for the business activity right away when the subscription does not require any action', () => {
    loginWith(activeSubscriptionUser);
    interceptAccountHolder();

    cy.mount(<App />);
    cy.wait('@getAccountHolder');

    cy.contains(BUSINESS_MODAL_TITLE).should('be.visible');
    cy.contains(SUBSCRIPTION_MODAL_TITLE).should('not.exist');
  });

  it('does not reopen the business activity modal once the activity has been saved', () => {
    cy.intercept('PUT', BUSINESS_ACTIVITIES_URL, req => {
      currentAccountHolder = { ...currentAccountHolder, businessActivities: req.body };
      req.reply(currentAccountHolder);
    }).as('updateBusinessActivities');
    loginWith(activeSubscriptionUser);
    interceptAccountHolder();

    cy.mount(<App />);
    cy.wait('@getAccountHolder');

    cy.contains(BUSINESS_MODAL_TITLE).should('be.visible');
    cy.dataCy('autocomplete-primary').type(NEW_PRIMARY_ACTIVITY);
    cy.contains('button', 'Enregistrer').click();
    cy.wait('@updateBusinessActivities');

    cy.contains(BUSINESS_MODAL_TITLE).should('not.exist');
    cy.contains('Bienvenue sur le dashboard de Birdia');
    cy.contains(BUSINESS_MODAL_TITLE).should('not.exist');
  });
});
