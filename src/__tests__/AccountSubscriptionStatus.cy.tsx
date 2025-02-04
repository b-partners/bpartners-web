import App from '@/App';
import { Redirect, Reload } from '@/common/utils';
import { NOOP_FN } from '@/common/utils/noop_fn';
import { SUBSCRIPTION_RANGE_LABELS } from '@/operations/account/components';
import { User, UserSubscriptionStatus, Whoami } from '@bpartners/typescript-client';
import {
  accountHolders1,
  accounts1,
  user_active_stripe,
  user_cancelled_stripe,
  user_free_trial_stripe,
  whoami_active_stripe,
  whoami_cancelled_stripe,
  whoami_free_trial_stripe,
} from './mocks/responses';

const doSubscriptionStatusTest = (subscription: UserSubscriptionStatus, user: User, whoami: Whoami, middleware: () => void = NOOP_FN) => {
  cy.intercept('GET', `/users/${user.id}/accounts`, accounts1).as('getAccount1');
  cy.cognitoLogin({ user, whoami });
  const carreleurs = [{ ...accountHolders1[0], businessActivities: { primary: 'Carreleur' } }];
  cy.intercept('GET', `/users/${whoami.user.id}/accounts/${accounts1[0].id}/accountHolders`, carreleurs).as('getAccountHolder1');
  cy.mount(<App />);
  const labels = SUBSCRIPTION_RANGE_LABELS[subscription];
  middleware();
  cy.getByName('account').click();
  cy.wait('@getAccount1');
  cy.getByTestId('my-abonnement-tab').click();
  cy.contains(labels.title);
  cy.contains(labels.start);
  cy.contains(labels.end);
  cy.contains(labels.description);
};

describe('Account Subscription Status', () => {
  beforeEach(() => {
    cy.stub(Redirect, 'toURL').as('redirect');
    cy.stub(Reload, 'force').as('reload');
  });

  it('should show correct subscription infos when user subscription = FREE_TRIAL', () => {
    doSubscriptionStatusTest('FREE_TRIAL', user_free_trial_stripe, whoami_free_trial_stripe, () => {
      cy.contains("Vous bénéficiez actuellement d'une période d'essai gratuite");
      cy.contains('Aucun prélèvement ne se fera avant la fin de votre période d’essai de 14 jours.');
      cy.getByTestId('close-dialog').click();
      cy.contains('Débloquer toutes les fonctionnalités IA pour les couvreurs');
    });
  });

  it('should show correct subscription infos when user subscription = CANCELLED', () => {
    doSubscriptionStatusTest('CANCELLED', user_cancelled_stripe, whoami_cancelled_stripe);
  });

  it('should show correct subscription infos when user subscription = ACTIVE', () => {
    doSubscriptionStatusTest('ACTIVE', user_active_stripe, whoami_active_stripe);
  });
});
