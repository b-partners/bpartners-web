import specTitle from 'cypress-sonarqube-reporter/specTitle';
import { authProvider } from 'src/providers';
import CompletePasswordPage from 'src/security/CompletePasswordPage';

describe(specTitle('Complete password page'), () => {
  it('should test next button', () => {
    cy.stub(authProvider, 'setNewPassword').as('setNewPassword');
    cy.mount(<CompletePasswordPage />);
    cy.contains('Première connexion ?');
    cy.get("input[name='phoneNumber']").type('{enter}');
    cy.contains('Ce champ est requis.');
    cy.get("input[name='phoneNumber']").type('012345678{enter}');
    cy.contains('Le numéro de téléphone doit contenir exactement dix (10) chiffres.');
    cy.get("input[name='phoneNumber']").clear().type('0123456789');

    cy.get("input[name='newPassword']").type('{enter}');
    cy.contains('Le mot de passe ne peut pas être vide.');
    cy.get("input[name='newPassword']").type(12);
    cy.contains('Le mot de passe doit contenir au moins 8 caractères.');
    cy.get("input[name='newPassword']").type(121212);
    cy.contains('Le mot de passe doit : - avoir au moins une majuscule - avoir au moins un caractère spécial !@#$%^&*()_+-= - avoir au moins un chiffre');
    cy.get("input[name='newPassword']").clear().type('1a!qwERty');
    cy.get("input[name='confirmedPassword']").type('not the prev pass');
    cy.contains('Les mots de passe ne correspondent pas !');

    cy.get('[data-testid="newPassword-field-input"] > .MuiInputBase-root > .MuiButtonBase-root > [data-testid="VisibilityIcon"]').click();
    cy.get('[data-testid="confirmedPassword-field-input"] > .MuiInputBase-root > .MuiButtonBase-root > [data-testid="VisibilityIcon"]').click();

    cy.get("input[name='confirmedPassword']").clear().type('1a!qwERty{enter}');
    cy.get('@setNewPassword').should('have.been.called');
  });
});
