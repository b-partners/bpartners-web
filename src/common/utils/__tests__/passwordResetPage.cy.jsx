import { awsAuth } from '@/providers';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import PasswordResetPage from '@/security/PasswordReset/PasswordResetPage';
import { Redirect } from '../redirect';

describe(specTitle('password reset page'), () => {
  it('failed to reset the password', () => {
    cy.stub(awsAuth, 'resetPassword').returns(Promise.resolve());
    cy.mount(<PasswordResetPage />);
    cy.contains('Mot de passe oublié ?');
    cy.get("input[name='email']").type('{enter}');
    cy.contains('Ce champ est requis');
    cy.get('input[name="email"]').type('myemail@gmail.com');
    cy.get('#sendMail_resetPassword').click();
    // close popup //
    cy.get('[data-testid="close-modal-id"]').click();
    // confirmation step //
    cy.intercept('POST', `https://cognito-idp.eu-west-3.amazonaws.com/`, req => {
      req.reply({
        statusCode: 400,
      });
    }).as('wrongValidationCode');
    cy.contains('Réinitialiser votre mot de passe');
    cy.get("input[name='resetCode']").type('{enter}');
    cy.contains('Ce champ est requis');
    cy.get('input[name="resetCode"]').type(123);
    cy.get('input[name="newPassword"]').type('myPsw');
    cy.contains('Le mot de passe doit contenir au moins 8 caractères.');
    cy.get('input[name="newPassword"]').type('myPswSecure');
    cy.contains('Le mot de passe doit : - avoir au moins une majuscule - avoir au moins un caractère spécial !@#$%^&*()_+-= - avoir au moins un chiffre');
    cy.get('input[name="newPassword"]').clear().type('4po*bM6H9K{');

    cy.get("input[name='confirmedPassword']").type('{enter}');
    cy.contains('Ce champ est requis');
    cy.get('input[name="confirmedPassword"]').type('myPsw');
    cy.contains('Les mots de passe ne correspondent pas !');
    cy.get('input[name="confirmedPassword"]').clear().type('4po*bM6H9K{');
    cy.get('#confirmation').click();

    cy.wait('@wrongValidationCode');
    cy.contains('Le code de validation est incorrect');
  });

  it('success to reset password', () => {
    cy.stub(awsAuth, 'resetPassword').returns(Promise.resolve());
    cy.stub(awsAuth, 'confirmResetPassword').returns(Promise.resolve());
    cy.stub(Redirect, 'toURL').as('redirect');

    cy.mount(<PasswordResetPage />);

    cy.get('input[name="email"]').type('myemail@gmail.com');

    cy.get('#sendMail_resetPassword').click();

    cy.get('[data-testid="close-modal-id"]').click();

    cy.get('input[name="resetCode"]').clear().type(54321);
    cy.get('input[name="newPassword"]').clear().type('4po*bM6H9K{');
    cy.get('input[name="confirmedPassword"]').clear().type('4po*bM6H9K{');

    cy.get('#confirmation').click();

    cy.contains('Votre mot de passe a été réinitialisé avec succès !');
    cy.get('#redirect-button-to-login').click();
    cy.get('@redirect').should('be.calledOnce');
  });
});
