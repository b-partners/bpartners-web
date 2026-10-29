import App from '@/App';
import { FreeTrialBannerWrapper, SecondaryUserInvitationBanner } from '@/common/components';
import { useOptimisticCreditBalanceStore } from '@/common/store';
import { Redirect } from '@/common/utils';
import { CreditsRequiredModalContent } from '@/operations/account/components/billing';
import { authProvider, getCached } from '@/providers';
import { SecondaryUser, User, Whoami } from '@bpartners/typescript-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { accountHolders1, accounts1, businessActivities, creditPacks, emptyCreditBalance } from './mocks/responses';
import { creditBalance } from './mocks/responses/credits-api';
import { user1, whoami1 } from './mocks/responses/security-api';

Cypress.on('uncaught:exception', () => false);

const PRIMARY_USER_ID = 'primary-user-id';

const secondaryWhoami: Whoami = { user: user1, primaryUserId: PRIMARY_USER_ID };
const freeTrialUser: User = { ...user1, subscription: { status: 'FREE_TRIAL', start: new Date(), end: new Date(Date.now() + 6 * 24 * 3600 * 1000) } };

const invitation: SecondaryUser = { id: 'invitation-1', primaryUserId: PRIMARY_USER_ID, email: 'principal@birdia.com', status: 'INVITED' };

const withClient = (children: JSX.Element) => <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;

describe('Secondary user detection', () => {
  it('is not secondary when primaryUserId is null', () => {
    cy.cognitoLogin({ whoami: { ...whoami1, primaryUserId: null } });
    cy.then(() => expect(authProvider.isSecondaryUser()).to.eq(false));
  });

  it('is not secondary when primaryUserId is absent', () => {
    cy.cognitoLogin();
    cy.then(() => expect(authProvider.isSecondaryUser()).to.eq(false));
  });

  it('is secondary and considered subscribed when primaryUserId is set', () => {
    cy.cognitoLogin({ whoami: { user: { ...user1, subscription: { status: 'EMPTY' } }, primaryUserId: PRIMARY_USER_ID } });
    cy.then(() => {
      expect(authProvider.isSecondaryUser()).to.eq(true);
      expect(authProvider.isSubscribed()).to.eq(true);
    });
  });
});

describe('Secondary user 403 handling', () => {
  const error = (url: string, status: number) => ({ response: { status, config: { url }, message: 'error' } });

  beforeEach(() => cy.cognitoLogin());

  ['/users/u/paymentMethods', '/users/u/subscriptionCancel', '/users/u/billingPortal', '/users/u/creditPurchases/p'].forEach(url =>
    it(`does not log out on a 403 from ${url}`, () => {
      cy.then(() => authProvider.checkError(error(url, 403))).should('be.undefined');
    })
  );

  it('still rejects a 403 from a non-billing route', () => {
    cy.then(() =>
      authProvider.checkError(error('/users/u/customers', 403)).then(
        () => {
          throw new Error('should have been rejected');
        },
        rejection => expect(rejection).to.deep.eq({ message: false })
      )
    );
  });
});

describe('FreeTrialBannerWrapper for a secondary user', () => {
  it('never shows the trial banner', () => {
    cy.cognitoLogin({ whoami: { user: freeTrialUser, primaryUserId: PRIMARY_USER_ID }, user: freeTrialUser });
    cy.intercept('GET', `/users/${user1.id}/creditBalance`, creditBalance);
    cy.mount(
      withClient(
        <FreeTrialBannerWrapper>
          <div data-cy='banner-child'>Contenu</div>
        </FreeTrialBannerWrapper>
      )
    );

    cy.get('[data-cy=banner-child]').should('be.visible');
    cy.contains("jours d'essai").should('not.exist');
    cy.contains('button', "S'abonner").should('not.exist');
  });
});

describe('SecondaryUserInvitationBanner', () => {
  it('renders nothing without pending invitations', () => {
    cy.cognitoLogin();
    cy.intercept('GET', `/users/${user1.id}/secondaryUserInvitations`, []).as('getInvitations');
    cy.mount(withClient(<SecondaryUserInvitationBanner />));

    cy.wait('@getInvitations');
    cy.contains('vous invite').should('not.exist');
  });

  it('does not even fetch invitations for a secondary user', () => {
    cy.cognitoLogin({ whoami: secondaryWhoami });
    cy.intercept('GET', `/users/${user1.id}/secondaryUserInvitations`, cy.spy().as('getInvitations'));
    cy.mount(withClient(<SecondaryUserInvitationBanner />));

    cy.contains('vous invite').should('not.exist');
    cy.get('@getInvitations').should('not.have.been.called');
  });

  it('shows the pending invitations and accepts one then reloads the app', () => {
    cy.cognitoLogin();
    cy.intercept('GET', `/users/${user1.id}/secondaryUserInvitations`, [invitation]).as('getInvitations');
    cy.intercept('PUT', `/users/${user1.id}/secondaryUserInvitations/${invitation.id}`, { ...invitation, status: 'ACTIVE', secondaryUserId: user1.id }).as(
      'acceptInvitation'
    );
    cy.stub(Redirect, 'reload').as('reload');
    cy.mount(withClient(<SecondaryUserInvitationBanner />));

    cy.wait('@getInvitations');
    cy.contains('Le compte principal@birdia.com vous invite à utiliser son abonnement et ses crédits.').should('be.visible');

    cy.intercept('GET', '/whoami', secondaryWhoami).as('refreshedWhoami');
    cy.getByName('accept-secondary-user-invitation').click();

    cy.wait('@acceptInvitation');
    cy.wait('@refreshedWhoami');
    cy.get('@reload').should('have.been.calledOnce');
    cy.then(() => expect(getCached.whoami().primaryUserId).to.eq(PRIMARY_USER_ID));
  });

  it('notifies the error and does not reload when the acceptance fails', () => {
    cy.cognitoLogin();
    cy.intercept('GET', `/users/${user1.id}/secondaryUserInvitations`, [invitation]);
    cy.intercept('PUT', `/users/${user1.id}/secondaryUserInvitations/${invitation.id}`, { statusCode: 400, body: { message: 'Invitation invalide' } }).as(
      'acceptInvitation'
    );
    cy.stub(Redirect, 'reload').as('reload');
    cy.mount(<MemoryRouter>{withClient(<SecondaryUserInvitationBanner />)}</MemoryRouter>);

    cy.getByName('accept-secondary-user-invitation').click();

    cy.wait('@acceptInvitation');
    cy.get('@reload').should('not.have.been.called');
    cy.getByName('accept-secondary-user-invitation').should('not.be.disabled');
  });
});

describe('Credits required modal', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/creditPacks*', creditPacks).as('getCreditPacks');
    cy.intercept('GET', `/users/${user1.id}/creditBalance`, emptyCreditBalance).as('getCreditBalance');
  });

  it('tells a secondary user to contact the primary account and offers no purchase', () => {
    cy.cognitoLogin({ whoami: secondaryWhoami });
    cy.mount(<MemoryRouter>{withClient(<CreditsRequiredModalContent />)}</MemoryRouter>);

    cy.contains('Crédits insuffisants, contactez le titulaire du compte principal.').should('be.visible');
    cy.contains("Crédits d'analyses").should('not.exist');
    cy.get('@getCreditPacks.all').should('have.length', 0);
  });

  it('keeps offering the credit packs to a primary user', () => {
    cy.cognitoLogin();
    cy.mount(<MemoryRouter>{withClient(<CreditsRequiredModalContent />)}</MemoryRouter>);

    cy.contains('Achetez un pack de crédits pour continuer.').should('be.visible');
    cy.contains('Crédits insuffisants, contactez').should('not.exist');
  });
});

describe('Account page', () => {
  const stubAccountApis = () => {
    cy.intercept('GET', `/users/${user1.id}/accounts`, accounts1);
    cy.intercept('GET', `/users/${user1.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder');
    cy.intercept('GET', '/businessActivities?page=1&pageSize=100', businessActivities);
    cy.intercept('GET', `/users/${user1.id}/creditBalance`, creditBalance).as('getCreditBalance');
    cy.intercept('GET', '**/subscriptionTrialEligibility*', []);
    cy.intercept('GET', '**/subscriptionPlans*', []);
  };

  it('shows only the credit balance and the primary account status to a secondary user', () => {
    cy.cognitoLogin({ whoami: secondaryWhoami });
    stubAccountApis();
    cy.mount(<App />);
    cy.wait('@getAccountHolder');

    cy.get('[name="account"]').click();
    cy.wait('@getCreditBalance');

    cy.contains("Vous utilisez l'abonnement et les crédits de votre compte principal.").should('be.visible');
    cy.contains('Crédits disponibles').should('be.visible');
    cy.dataCy('secondary-user-credits-chart').should('contain.text', '320').find('path').should('have.length.at.least', 1);
    cy.contains('Mon abonnement').should('not.exist');
    cy.getByName('open-billing-modal').should('not.exist');
    cy.getByName('open-subscription-modal').should('not.exist');
    cy.contains('Période de votre abonnement').should('not.exist');
  });

  it('asks a secondary user without credits to contact the primary user', () => {
    cy.cognitoLogin({ whoami: secondaryWhoami });
    stubAccountApis();
    cy.intercept('GET', `/users/${user1.id}/creditBalance`, emptyCreditBalance).as('getEmptyCreditBalance');
    cy.mount(<App />);
    cy.wait('@getAccountHolder');

    cy.get('[name="account"]').click();
    cy.wait('@getEmptyCreditBalance');

    cy.dataCy('secondary-user-no-credits').should('be.visible').and('contain.text', 'contactez le titulaire du compte principal pour recharger le compte');
    cy.getByName('open-billing-modal').should('not.exist');
    cy.dataCy('secondary-user-credits-chart')
      .closest('.card')
      .invoke('outerHeight')
      .then(secondaryHeight => {
        cy.get('.card-user').invoke('outerHeight').should('eq', secondaryHeight);
      });
  });

  it('does not show the no-credit message while the secondary user has credits', () => {
    cy.cognitoLogin({ whoami: secondaryWhoami });
    stubAccountApis();
    cy.mount(<App />);
    cy.wait('@getAccountHolder');

    cy.get('[name="account"]').click();
    cy.wait('@getCreditBalance');

    cy.dataCy('secondary-user-credits-chart').should('contain.text', '320');
    cy.dataCy('secondary-user-no-credits').should('not.exist');
  });

  describe('optimistic balance reconciliation', () => {
    const optimisticBalance = { ...creditBalance, spendableCredits: 310, grantedCredits: 190, purchasedCredits: 120 };

    beforeEach(() => useOptimisticCreditBalanceStore.getState().clear());

    afterEach(() => useOptimisticCreditBalanceStore.getState().clear());

    const openAccountWith = (balance: typeof creditBalance) => {
      cy.cognitoLogin({ whoami: secondaryWhoami });
      stubAccountApis();
      cy.intercept('GET', `/users/${user1.id}/creditBalance`, balance).as('getReconciledBalance');
      cy.mount(<App />);
      cy.wait('@getAccountHolder');
      cy.get('[name="account"]').click();
      cy.wait('@getReconciledBalance');
      cy.then(() => useOptimisticCreditBalanceStore.getState().setBalance(optimisticBalance));
    };

    it('displays the optimistic balance and keeps it while the API stays stale', () => {
      openAccountWith(creditBalance);

      cy.dataCy('secondary-user-credits-chart').should('contain.text', '310');
      cy.wait('@getReconciledBalance');
      cy.wrap(null).should(() => expect(useOptimisticCreditBalanceStore.getState().balance).to.not.be.undefined);
      cy.dataCy('secondary-user-credits-chart').should('contain.text', '310');
    });

    it('clears the optimistic balance once the API returns the matching balance', () => {
      openAccountWith(optimisticBalance);

      cy.wrap(null, { timeout: 8000 }).should(() => expect(useOptimisticCreditBalanceStore.getState().balance).to.be.undefined);
      cy.dataCy('secondary-user-credits-chart').should('contain.text', '310');
    });
  });

  it('keeps the secondary card at the same height as the user card', () => {
    cy.cognitoLogin({ whoami: secondaryWhoami });
    stubAccountApis();
    cy.mount(<App />);
    cy.wait('@getAccountHolder');

    cy.get('[name="account"]').click();
    cy.wait('@getCreditBalance');

    cy.dataCy('secondary-user-credits-chart')
      .closest('.card')
      .invoke('outerHeight')
      .then(secondaryHeight => {
        cy.get('.card-user').invoke('outerHeight').should('eq', secondaryHeight);
      });
  });

  it('keeps the billing card for a primary user', () => {
    cy.cognitoLogin();
    stubAccountApis();
    cy.mount(<App />);
    cy.wait('@getAccountHolder');

    cy.get('[name="account"]').click();

    cy.contains('Mon abonnement').should('be.visible');
    cy.getByName('open-billing-modal').should('be.visible');
    cy.contains("Vous utilisez l'abonnement et les crédits de votre compte principal.").should('not.exist');
  });
});
