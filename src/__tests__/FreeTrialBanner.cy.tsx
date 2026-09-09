import { FreeTrialBannerWrapper } from '@/common/components';
import { useOptimisticCreditBalanceStore } from '@/common/store';
import { useDialog } from '@/common/store/dialog';
import { CreditBalance, User } from '@bpartners/typescript-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { creditBalance } from './mocks/responses/credits-api';
import { user1 } from './mocks/responses/security-api';

Cypress.on('uncaught:exception', () => false);

const trialEnd = dayjs().add(6, 'day').add(2, 'hour').toDate();
const remainingDays = dayjs(trialEnd).diff(dayjs(), 'day');

const freeTrialUser: User = { ...user1, subscription: { status: 'FREE_TRIAL', start: new Date(), end: trialEnd } };
const activeUser: User = { ...user1, subscription: { status: 'ACTIVE', start: new Date(), end: trialEnd } };

const mountBanner = (user: User, balance: CreditBalance) => {
  cy.cognitoLogin({ whoami: { user }, user });
  cy.intercept('GET', `/users/${user1.id}/creditBalance`, balance).as('getCreditBalance');
  cy.mount(
    <QueryClientProvider client={new QueryClient()}>
      <FreeTrialBannerWrapper>
        <div data-cy='banner-child'>Contenu de la plateforme</div>
      </FreeTrialBannerWrapper>
    </QueryClientProvider>
  );
};

describe('FreeTrialBannerWrapper', () => {
  beforeEach(() => {
    useDialog.getState().close();
    useOptimisticCreditBalanceStore.getState().clear();
  });

  afterEach(() => useOptimisticCreditBalanceStore.getState().clear());

  it('shows the remaining trial days and analyses for a free-trial user', () => {
    mountBanner(freeTrialUser, creditBalance);

    cy.wait('@getCreditBalance');
    cy.contains(`Il vous reste ${remainingDays} jours d'essai et ${creditBalance.estimatedRemainingAnalyses} analyses toitures`).should('be.visible');
    cy.contains('button', "S'abonner").should('be.visible');
    cy.get('[data-cy=banner-child]').should('be.visible');
  });

  it('reflects the optimistic credit balance for the remaining analyses', () => {
    mountBanner(freeTrialUser, creditBalance);
    cy.wait('@getCreditBalance');

    cy.then(() => useOptimisticCreditBalanceStore.getState().setBalance({ ...creditBalance, estimatedRemainingAnalyses: 5 }));

    cy.contains(`Il vous reste ${remainingDays} jours d'essai et 5 analyses toitures`).should('be.visible');
  });

  it('does not render the banner for a non-free-trial user', () => {
    mountBanner(activeUser, creditBalance);

    cy.get('[data-cy=banner-child]').should('be.visible');
    cy.contains("jours d'essai").should('not.exist');
  });
});
