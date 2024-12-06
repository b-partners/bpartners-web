import App from '@/App';
import { Redirect, Reload } from '@/common/utils';
import { BpAdmin } from '@/security/BpAdmin';
import { UserSubscriptionCheckWrapper } from '@/security/UserSubscriptionCheckWrapper';
import { Redirection2, User, Whoami } from '@bpartners/typescript-client';
import { FC, ReactNode, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router';
import { BrowserRouter, useSearchParams } from 'react-router-dom';
import { account1, accountHolder1, accounts1, user1 } from './mocks/responses';
const user_empty_stripe: User = {
  ...user1,
  subscription: {
    end: null,
    start: null,
    status: 'EMPTY',
  },
};
const whoami_empty_stripe: Whoami = { user: user_empty_stripe };

const user_active_stripe: User = {
  ...user1,
  subscription: {
    end: new Date('2024-10-10'),
    start: new Date('2024-09-10'),
    status: 'ACTIVE',
  },
};
const whoami_active_stripe: Whoami = { user: user_active_stripe };

const user_cancelled_stripe: User = {
  ...user1,
  subscription: {
    end: new Date('2024-10-10'),
    start: new Date('2024-09-10'),
    status: 'CANCELLED',
  },
};

const expectedStripeSubscriptionBody = {
  redirectionStatusUrls: {
    failureUrl: 'https://dashboard.preprod.bpartners.app/?stripeStatus=error',
    successUrl: 'https://dashboard.preprod.bpartners.app/account/mock-user-id1?stripeStatus=done',
  },
  subscriptionType: 'ESSENTIAL',
};

const stripeSubscriptionResponse: Redirection2 = {
  redirectionStatusUrls: expectedStripeSubscriptionBody.redirectionStatusUrls,
  redirectionUrl: 'http://dummy-url.com',
};

const Wrapper: FC<{ children?: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    navigate(`/account/${account1.id}/?stripeStatus=done`);
  }, []);

  return searchParams.get('stripeStatus') === 'done' ? children : <div></div>;
};

describe('User subscription', () => {
  beforeEach(() => {
    cy.stub(Redirect, 'toURL').as('redirect');
    cy.stub(Reload, 'force').as('reload');
    cy.intercept('GET', `/users/${user_empty_stripe.id}/accounts`, accounts1);
  });

  it('Show modal on cancel user subscription', () => {
    cy.cognitoLogin({ user: user_active_stripe, whoami: whoami_active_stripe });
    cy.intercept('GET', `/users/${user_active_stripe.id}/accounts`, accounts1);
    cy.intercept('GET', `/users/${user_active_stripe.id}/accounts/${accounts1[0].id}/accountHolders`, [accountHolder1]);
    cy.intercept('POST', `/users/${user_active_stripe.id}/subscriptionCancel`, user_cancelled_stripe);
    cy.mount(<App />);

    cy.contains('Mon compte').click();
    cy.contains('Mon compte').click();

    cy.contains('Mon abonnement').click();
    cy.contains('Annuler le renouvellement de mon abonnement').click();
    cy.contains("Vous conserverez l'accès à toutes les fonctionnalités de votre abonnement jusqu'au 10 octobre 2024");
    cy.contains("Confirmation de l'annulation du renouvellement automatique");

    cy.contains('Confirmer').click();

    cy.contains("Votre renouvellement automatique a été annulé avec succès ; vous conserverez l'accès jusqu'au 10 octobre 2024");
  });

  it('Should show modal on subscription is success', () => {
    cy.cognitoLogin({ user: user_active_stripe, whoami: whoami_active_stripe });
    cy.intercept('GET', `/users/${user_active_stripe.id}/accounts`, accounts1);
    cy.intercept('GET', `/users/${user_active_stripe.id}/accounts/${accounts1[0].id}/accountHolders`, [accountHolder1]);
    cy.intercept('POST', `/users/${user_active_stripe.id}/subscriptionCancel`, user_cancelled_stripe);
    cy.mount(
      <BrowserRouter>
        <Routes>
          <Route
            path='*'
            element={
              <Wrapper>
                <UserSubscriptionCheckWrapper>
                  <BpAdmin />
                </UserSubscriptionCheckWrapper>
              </Wrapper>
            }
          />
        </Routes>
      </BrowserRouter>
    );
    cy.contains('Inscription terminée');

    cy.contains('Votre abonnement a été effectué avec succès, et votre inscription est dorénavant terminée.');
    cy.contains('Fermer').click();
    cy.contains("Date d'expiration");
    cy.contains('10/10/2024');
    cy.contains('Pour 49€ par mois:');
  });

  it('Show modal if user do not have subscription', () => {
    cy.cognitoLogin({ user: user_empty_stripe, whoami: whoami_empty_stripe });
    cy.intercept('POST', `/users/${user_empty_stripe.id}/subscriptionInitiation`, req => {
      expect(req.body).deep.equal(expectedStripeSubscriptionBody);
      req.reply(stripeSubscriptionResponse);
    });
    cy.mount(<App />);

    cy.contains('Finalisez votre inscription en toute sérénité !');
    cy.contains('Aucun prélèvement ne se fera avant la fin de votre période d’essai de 14 jours.');

    cy.contains("S'abonner").click();
  });
});
