import specTitle from 'cypress-sonarqube-reporter/specTitle';
import { MemoryRouter } from 'react-router-dom';

import LoginSuccessPage from '../security/LoginSuccessPage';

import App from '@/App';
import { recaptchaProvider } from '@/providers';
import { SignUpForm } from '@/security/SignUpForm';
import { Redirect } from '../common/utils';

describe(specTitle('Login'), () => {
  beforeEach(() => {
    cy.stub(Redirect, 'toURL').as('toURL');
    cy.stub(recaptchaProvider, 'useGoogleReCaptcha').returns({ executeRecaptcha: () => Promise.resolve('mock-recaptcha-token'), valide: false });
    cy.intercept('GET', `/captcha/token**`, { body: true }).as('validateCaptcha');
  });

  it('Should show signIn and signUp form with validator', () => {
    Cypress.config('requestTimeout', 4000);
    cy.intercept('POST', '/onboarding', []);
    cy.mount(<App />);
    cy.contains('Bienvenue !');
    cy.get('#register > .MuiTypography-root').click();

    cy.contains('Inscription');
    cy.contains('Vous avez déjà un compte ? Se connecter');

    cy.get("[name='lastName']").type('Numer');
    cy.get("[type='submit']").click();
    cy.get("[name='lastName']").clear();
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
    cy.get("[name='username']").clear();
    cy.contains('Ce champ est requis');
    cy.get("[name='password']").type('dummy');
    cy.contains('Ce champ est requis');
    cy.intercept('https://cognito-idp.eu-west-3.amazonaws.com/', res => {
      res.reply({ statusCode: 400, body: { __type: 'NotAuthorizedException', message: 'Incorrect username or password.' } });
    });
    cy.get("[name='username']").type('dummy{enter}');
    cy.contains('Les identifiants sont incorrects.');
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

describe(specTitle('SignUp promo code'), () => {
  beforeEach(() => {
    cy.stub(recaptchaProvider, 'useGoogleReCaptcha').returns({ executeRecaptcha: () => Promise.resolve('mock-recaptcha-token'), valide: false });
    cy.intercept('GET', '**/captcha/token**', { body: true }).as('validateCaptcha');
  });

  const fillRequiredFields = () => {
    cy.get("[name='lastName']").type('Doe');
    cy.get("[name='firstName']").type('John');
    cy.get("[name='email']").type('john.doe@gmail.com');
    cy.get("[name='phoneNumber']").type('123456789');
    cy.get("[name='companyName']").type('Numer');
  };

  it('prefills the Code promo field from the URL query param', () => {
    cy.mount(
      <MemoryRouter initialEntries={['/sign-up?promoCode=SUMMER2026']}>
        <SignUpForm />
      </MemoryRouter>
    );
    cy.get("[name='promoCode']").should('have.value', 'SUMMER2026');
  });

  it('warns on an invalid promo code but still completes signup', () => {
    cy.intercept('GET', '**/promoCodes/BADCODE', { statusCode: 404, body: {} }).as('checkPromoCode');
    cy.intercept('POST', '**/onboarding', []).as('onboard');
    cy.mount(
      <MemoryRouter initialEntries={['/sign-up']}>
        <SignUpForm />
      </MemoryRouter>
    );
    fillRequiredFields();
    cy.get("[name='promoCode']").type('BADCODE');
    cy.get("[type='submit']").click();
    cy.wait('@checkPromoCode');
    cy.contains('Promo code invalide');
    cy.wait('@onboard');
  });

  it('shows no promo-code warning and completes signup when no code is given', () => {
    cy.intercept('POST', '**/onboarding', []).as('onboard');
    cy.mount(
      <MemoryRouter initialEntries={['/sign-up']}>
        <SignUpForm />
      </MemoryRouter>
    );
    fillRequiredFields();
    cy.get("[type='submit']").click();
    cy.wait('@onboard');
    cy.contains('Promo code invalide').should('not.exist');
  });

  it('shows a dedicated toast when the captcha check fails', () => {
    recaptchaProvider.useGoogleReCaptcha.restore();
    cy.stub(recaptchaProvider, 'useGoogleReCaptcha').returns({ executeRecaptcha: () => Promise.reject(new Error('captcha blocked')), valide: false });
    cy.mount(
      <MemoryRouter initialEntries={['/sign-up']}>
        <SignUpForm />
      </MemoryRouter>
    );
    fillRequiredFields();
    cy.get("[type='submit']").click();
    cy.contains('Échec de la vérification anti-robot, veuillez réessayer');
  });

  it('shows a toast when required fields are missing on submit', () => {
    cy.mount(
      <MemoryRouter initialEntries={['/sign-up']}>
        <SignUpForm />
      </MemoryRouter>
    );
    cy.get("[type='submit']").click();
    cy.contains('Veuillez remplir tous les champs requis');
  });
});
