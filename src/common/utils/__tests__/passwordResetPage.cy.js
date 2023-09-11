import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import PasswordResetPage from 'src/security/PasswordReset/PasswordResetPage';

describe(specTitle('password reset page'), () => {
  it('be able to reset the password', () => {
    mount(<PasswordResetPage />);
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
    cy.contains('Le code de validation est incorrecte');

    cy.get('input[name="resetCode"]').clear().type(54321);

    cy.intercept('POST', `https://cognito-idp.eu-west-3.amazonaws.com/`, req => {
      req.reply({
        statusCode: 200,
      });
    }).as('passwordResetSuccessfully');

    cy.get('#confirmation').click();

    cy.wait('@passwordResetSuccessfully');

    cy.contains('Votre mot de passe a été réinitialisé avec succès !');
    cy.get('#redirect-button-to-login').click();
  });
});
