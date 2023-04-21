import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import authProvider from 'src/providers/auth-provider';
import CompletePasswordPage from 'src/security/CompletePasswordPage';

describe(specTitle('Complete password page'), () => {
  it('should test next button', () => {
    cy.stub(authProvider, 'setNewPassword').as('setNewPassword');
    mount(<CompletePasswordPage />);
    cy.contains('Première connexion ?');
    cy.get("input[name='newPassword']").type('{enter}');
    cy.contains('Le mot de passe ne peut pas être vide.');
    cy.get("input[name='newPassword']").type(12);
    cy.contains(
      'Le mot de passe doit : - avoir au moins 8 caractères - avoir au moins une majuscule - avoir au moins un caractère spécial !@#$%^&*()_+-= - avoir au moins un chiffre'
    );
    cy.get("input[name='newPassword']").clear().type('1a!qwERty');
    cy.get("input[name='confirmedPassword']").type('not the prev pass');
    cy.contains('Les mots de passe ne correspondent pas !');

    cy.get('[data-testid="newPassword-field-input"] > .MuiInputBase-root > .MuiButtonBase-root > [data-testid="VisibilityIcon"]').click();
    cy.get('[data-testid="confirmedPassword-field-input"] > .MuiInputBase-root > .MuiButtonBase-root > [data-testid="VisibilityIcon"]').click();

    cy.get("input[name='confirmedPassword']").clear().type('1a!qwERty{enter}');
    cy.get('@setNewPassword').should('have.been.called');
  });
});
