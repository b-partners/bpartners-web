import App from '@/App';
import { awsAuth } from '@/providers';
import PasswordResetPage from '@/security/PasswordReset/PasswordResetPage';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Redirect } from '../redirect';

describe(specTitle('password reset page'), () => {
  it('success to reset password', () => {
    cy.stub(awsAuth, 'resetPassword').returns(Promise.resolve());
    cy.stub(awsAuth, 'confirmResetPassword').returns(Promise.resolve());
    cy.stub(Redirect, 'toURL').as('redirect');

    cy.mount(<App />);

    cy.contains('Mot de passe oublié ?').click();

    cy.contains(
      "Renseignez l'adresse mail associée à votre compte, puis cliquez sur continuer. Nous vous enverrons par e-mail un code de validation qui vous permettra de réinitialiser votre mot de passe."
    );

    cy.name('email').type('test@email.com{enter}');

    cy.name('resetCode').type('808080{enter}');
    cy.contains('Le mot de passe doit contenir au moins 8 caractères.');

    cy.name('newPassword').clear().type('12345678');
    cy.contains('Le mot de passe doit : - avoir au moins une majuscule - avoir au moins un caractère spécial !@#$%^&*()_+-= - avoir au moins un chiffre');

    cy.name('newPassword').clear().type('12qwER!@');
    cy.contains('Ce champ est requis.');

    cy.name('confirmedPassword').clear().type('12qwER!');
    cy.contains('Les mots de passe ne correspondent pas !');

    cy.name('confirmedPassword').clear().type('12qwER!@');

    cy.get('[type="submit"]').click();

    cy.contains('Votre mot de passe a été réinitialisé avec succès !');

    cy.get('#redirect-button-to-login').click();

    cy.contains('Bienvenue !');
  });
});
