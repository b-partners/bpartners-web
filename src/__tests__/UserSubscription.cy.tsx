import App from '@/App';
import { Redirect, Reload } from '@/common/utils';
import { BpAdmin } from '@/security/BpAdmin';
import { UserSubscriptionCheckWrapper } from '@/security/UserSubscriptionCheckWrapper';
import { FC, ReactNode, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router';
import { BrowserRouter, useSearchParams } from 'react-router-dom';
import {
  account1,
  accountHolder1,
  accounts1,
  expectedStripeSubscriptionBody,
  stripeSubscriptionResponse,
  user_active_stripe,
  user_cancelled_stripe,
  user_empty_stripe,
  whoami_active_stripe,
  whoami_empty_stripe,
} from './mocks/responses';

const currentYear = new Date().getFullYear();

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
    cy.contains("Vous conserverez l'accès à toutes les fonctionnalités de votre abonnement jusqu'au 10 octobre " + currentYear);
    cy.contains("Confirmation de l'annulation du renouvellement automatique");

    cy.contains('Confirmer').click();

    cy.contains("Votre renouvellement automatique a été annulé avec succès ; vous conserverez l'accès jusqu'au 10 octobre " + currentYear);
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
    cy.contains("Début de la période d'abonnement en cours");
    cy.contains("Fin de la période d'abonnement en cours");
    cy.contains('10/10/' + currentYear);
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

    cy.contains("S'abonner").click();
  });
});
