import { SubscriptionModal } from '@/common/components';
import { useDialog } from '@/common/store/dialog';
import { User } from '@bpartners/typescript-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { MemoryRouter } from 'react-router-dom';
import { visaPaymentMethods } from './mocks/responses/payment-method-api';
import { user1 } from './mocks/responses/security-api';
import { subscriptionPlans } from './mocks/responses/subscription-plans-api';

const emptyUser: User = { ...user1, subscription: { status: 'EMPTY', start: null, end: null } };
const expiredCancelledUser: User = {
  ...user1,
  subscription: { status: 'CANCELLED', start: new Date('2025-01-01T00:00:00Z'), end: dayjs().subtract(1, 'day').toDate() },
};
const activeCancelledUser: User = {
  ...user1,
  subscription: { status: 'CANCELLED', start: new Date('2026-01-01T00:00:00Z'), end: dayjs().add(1, 'year').toDate() },
};

const mountModal = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  cy.mount(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SubscriptionModal allowClose />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('SubscriptionModal — mandatory choice for expired subscriptions', () => {
  beforeEach(() => {
    useDialog.getState().close();
    cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
    cy.intercept('GET', '**/paymentMethods*', []).as('getPaymentMethods');
  });

  const assertMandatory = () => {
    mountModal();
    cy.wait('@getSubscriptionPlans');
    cy.contains('button', 'Ajouter une carte').should('be.visible');
    cy.contains('button', 'Se déconnecter').should('be.visible');
    cy.contains('button', 'Plus tard').should('not.exist');
  };

  it('offers to add a card or log out on an EMPTY subscription even when opened as closeable', () => {
    cy.cognitoLogin({ whoami: { user: emptyUser }, user: emptyUser });
    assertMandatory();
  });

  it('lets an EMPTY subscription with a registered card reach the platform instead of logging out', () => {
    cy.intercept('GET', '**/paymentMethods*', visaPaymentMethods).as('getPaymentMethods');
    cy.cognitoLogin({ whoami: { user: emptyUser }, user: emptyUser });
    mountModal();
    cy.wait('@getSubscriptionPlans');
    cy.wait('@getPaymentMethods');
    cy.contains('button', 'Accéder à la plateforme').should('be.visible');
    cy.contains('button', 'Ajouter une carte').should('not.exist');
    cy.contains('button', 'Se déconnecter').should('not.exist');
  });

  it('offers to add a card or log out once a CANCELLED subscription has expired', () => {
    cy.cognitoLogin({ whoami: { user: expiredCancelledUser }, user: expiredCancelledUser });
    assertMandatory();
  });

  it('still lets the user postpone while a CANCELLED subscription is not expired yet and a card is registered', () => {
    cy.intercept('GET', '**/paymentMethods*', visaPaymentMethods).as('getPaymentMethods');
    cy.cognitoLogin({ whoami: { user: activeCancelledUser }, user: activeCancelledUser });
    mountModal();
    cy.wait('@getSubscriptionPlans');
    cy.wait('@getPaymentMethods');
    cy.contains('button', 'Plus tard').should('be.visible');
    cy.contains('button', 'Se déconnecter').should('not.exist');
  });

  it('offers to add a card or log out on a not-expired CANCELLED subscription without any payment method', () => {
    cy.cognitoLogin({ whoami: { user: activeCancelledUser }, user: activeCancelledUser });
    assertMandatory();
  });
});
