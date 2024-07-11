import specTitle from 'cypress-sonarqube-reporter/specTitle';

import LoginSuccessPage from '../security/LoginSuccessPage';

import App from '@/App';
import { Redirect } from '../common/utils';

describe(specTitle('Login'), () => {
  beforeEach(() => {
    cy.stub(Redirect, 'toURL').as('toURL');
  });

  it('Should show signIn and signUp form with validator', () => {
    Cypress.config('requestTimeout', 4000);
    cy.intercept('POST', '/onboarding', []);
    cy.mount(<App />);
    cy.contains('Bienvenue !');
    cy.get('#register > .MuiTypography-root').click();

    cy.contains('Inscription');
    cy.contains('Vous avez déjà un compte ? Se connecter');

    cy.get("[name='lastName']").type('{enter}');
    cy.contains('Ce champ est requis');
    cy.get("[name='phoneNumber']").type('test');
    cy.contains('Le numéro de téléphone ne doit contenir que des chiffres');
    cy.get("[name='phoneNumber']").clear();
    cy.get("[name='lastName']").type('Doe');
    cy.get("[name='firstName']").type('John');
    cy.get("[name='email']").type('john.doe@gmail.com');
    cy.get("[name='phoneNumber']").type('123456789');
    cy.get("[name='companyName']").type('Numer');
    cy.get("[type='submit']").click();
    cy.contains('Pour finaliser votre inscription, un mail vous a été envoyé.');
    cy.get("[data-testid='close-modal-id']").click();
    cy.contains('Bienvenue !');
    cy.contains("Pas de compte ? C'est par ici");
  });

  it('SuccessPage redirects to / on valid code', () => {
    cy.mount(<LoginSuccessPage />);
    cy.contains('Vous êtes authentifiés !');
    cy.get('@toURL').should('have.been.calledOnce');
  });

  it.skip('MainPage redirects to onboarding url', () => {
    // TODO(cognito-signup)
    cy.mount(<App />);
    cy.intercept('POST', '/onboardingInitiation', { redirectionUrl: 'https://authUrl.com' }).as('onboardingInitiation');
    cy.get('#register').contains(`Pas de compte ? C'est par ici`);
    cy.get('#register').click();
    cy.wait('@onboardingInitiation');
    cy.get('@toURL').should('have.been.calledOnce');
  });

  it('Test Login form', () => {
    cy.mount(<App />);
    cy.contains('Votre email');
    cy.get("[name='username']").type('dummy{enter}');
    cy.contains('Ce champ est requis');
    cy.get("[name='password']").type('dummy');
    cy.get("[name='username']").clear();
    cy.contains('Ce champ est requis');
    cy.get("[name='username']").type('dummy{enter}');
  });

  it('Should show the CGU in a new tab', () => {
    cy.mount(<App />);
    cy.window().then(win => {
      cy.stub(win, 'open').as('windowOpen');
    });
    cy.contains("Conditions générales d'utilisation").click();
    cy.get('@windowOpen').should('be.calledOnce');
    cy.get('@windowOpen').invoke('getCall', 0).should('have.been.calledWithMatch', 'https://legal.bpartners.app');
  });
});
