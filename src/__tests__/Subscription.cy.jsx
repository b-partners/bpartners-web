import App from '@/App';
import { whoami } from '@/providers';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import { Redirect } from '../common/utils';
import { accountHolders1, accounts1, validationRedirectionUrl } from './mocks/responses/account-api';
import { user1, whoami1 } from './mocks/responses/security-api';

const invalidSubscriptionUser = { ...user1, subscription: { end: null, start: null, status: 'EMPTY' } };
const expectedSubscriptionInitializationPayload = {
  redirectionStatusUrls: {
    failureUrl: 'https://dashboard.preprod.bpartners.app/?stripeStatus=error',
    successUrl: 'https://dashboard.preprod.bpartners.app/account/mock-user-id1?stripeStatus=done',
  },
  subscriptionType: 'ESSENTIAL',
};

describe(specTitle('Test user subscription'), () => {
  it('Invalid subscription', () => {
    cy.cognitoLogin({ whoami: { user: invalidSubscriptionUser }, user: invalidSubscriptionUser });

    cy.stub(Redirect, 'toURL').as('toURL');

    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');

    cy.mount(<App />);

    cy.contains('Finalisez votre inscription en toute sérénité !');
    cy.contains(
      'Vous n’avez pas encore d’abonnement actif. Pour continuer à utiliser l’application BIRDIA, veuillez enregistrer votre carte bancaire via notre partenaire sécurisé Stripe.'
    );
    cy.contains('Si vous avez la moindre question, N’hésitez à nous appeler au 06.68.62.48.36 ou par mail à contact@birdia.fr');

    cy.intercept(`/users/${invalidSubscriptionUser.id}/subscriptionInitiation`, { statusCode: 200 }).as('initializeSubscription');
    cy.dataCy('subscribe-btn').click();
    cy.wait('@initializeSubscription').then(({ request }) => {
      expect(request.body).deep.equal(expectedSubscriptionInitializationPayload);
    });
    cy.get('@toURL').should('have.been.called');
  });
});
