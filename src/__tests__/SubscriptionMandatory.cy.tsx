import { SubscriptionModal } from '@/common/components';
import { useDialog } from '@/common/store/dialog';
import { User } from '@bpartners/typescript-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { MemoryRouter } from 'react-router-dom';
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
  });

  const assertMandatory = () => {
    mountModal();
    cy.wait('@getSubscriptionPlans');
    cy.contains('button', 'Se déconnecter').should('be.visible');
    cy.contains('button', 'Plus tard').should('not.exist');
  };

  it('forces logout on an EMPTY subscription even when opened as closeable', () => {
    cy.cognitoLogin({ whoami: { user: emptyUser }, user: emptyUser });
    assertMandatory();
  });

  it('forces logout once a CANCELLED subscription has expired', () => {
    cy.cognitoLogin({ whoami: { user: expiredCancelledUser }, user: expiredCancelledUser });
    assertMandatory();
  });

  it('still lets the user postpone while a CANCELLED subscription is not expired yet', () => {
    cy.cognitoLogin({ whoami: { user: activeCancelledUser }, user: activeCancelledUser });
    mountModal();
    cy.wait('@getSubscriptionPlans');
    cy.contains('button', 'Plus tard').should('be.visible');
    cy.contains('button', 'Se déconnecter').should('not.exist');
  });
});
