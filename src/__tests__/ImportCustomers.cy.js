import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import authProvider from 'src/providers/auth-provider';
import * as Redirect from '../common/utils/redirect';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
import { token1, user1, whoami1 } from './mocks/responses/security-api';

describe(specTitle('Import Customers'), () => {
  beforeEach(() => {
    //note(login-user1)
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
    cy.then(
      async () =>
        await authProvider.login('dummy', 'dummy', {
          redirectionStatusUrls: {
            successurl: 'dummy',
            FailureUrl: 'dummy',
          },
        })
    );

    cy.intercept('GET', '/accounts/mock-account-id1/customers?page=1&pageSize=15', customers1).as('getCustomers');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1');

    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('Import wrong clients file', () => {
    cy.intercept('POST', `/accounts/${accounts1[0].id}/customers/upload`, req => {
      req.reply({
        statusCode: 400,
        body: {
          message: errorMessage,
        },
      });
    }).as('importWrongCustomerFile');

    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="customers"]').click();
    cy.wait('@getCustomers');

    cy.get('[data-testid="import-modal-button"]').click();

    cy.contains('Importer des clients');
    cy.contains('Pour importer une liste de vos clients, le fichier Excel (.xls ou .xlsx) contenant la liste doit suivre le modèle suivant :');
    cy.contains(`Veuillez à ce que votre fichier soit structuré comme le modèle avant de l'importer.`);
    cy.contains(`Ou mieux encore, téléchargez ce modèle et copiez vos clients pour être sûr que les colonnes correspondent.`);

    const _path = 'cypress/fixtures';
    const _mockFile = `${_path}/import-mock.xlsx`;
    const errorMessage =
      '"Nom" instead of "Description" at column 1. "Prénom(s)" instead of "Quantité" at column 2. "Email" instead of "Prix unitaire (€)" at column 3. "Téléphone" instead of "TVA (%)" at column 4. ';

    cy.get('#upload-file-label').should('be.visible').selectFile(_mockFile);

    cy.contains('import-mock.xlsx');

    cy.get('[data-testid="import-button"]').click();

    cy.wait('@importWrongCustomerFile');

    cy.contains('Importation en cours...');

    cy.contains(`Une erreur s'est produite lors de l'importation.`);

    cy.contains(`Les colonnes suivantes ne correspondent pas :`);
    cy.contains(`"Nom" à la place de "Description" à la colonne 1`);
    cy.contains(`"Prénom(s)" à la place de "Quantité" à la colonne 2`);
    cy.contains(`"Email" à la place de "Prix unitaire (€)" à la colonne 3`);
    cy.contains(`"Téléphone" à la place de "TVA (%)" à la colonne 4`);

    cy.get('[data-testid="CancelIcon"]').click();

    cy.contains('import-mock.xlsx').should('not.exist');

    cy.contains(`Les colonnes suivantes ne correspondent pas :`).should('not.exist');
  });

  it('Import valid clients file', () => {
    cy.intercept('POST', `/accounts/${accounts1[0].id}/customers/upload`, customers1).as('importValidCustomers');

    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="customers"]').click();
    cy.wait('@getCustomers');

    cy.get('[data-testid="import-modal-button"]').click();

    cy.contains('Importer des clients');
    cy.contains('Pour importer une liste de vos clients, le fichier Excel (.xls ou .xlsx) contenant la liste doit suivre le modèle suivant :');
    cy.contains(`Veuillez à ce que votre fichier soit structuré comme le modèle avant de l'importer.`);
    cy.contains(`Ou mieux encore, téléchargez ce modèle et copiez vos clients pour être sûr que les colonnes correspondent.`);

    const _path = 'cypress/fixtures';
    const _mockFile = `${_path}/import-mock.xlsx`;

    cy.get('#upload-file-label').should('be.visible').selectFile(_mockFile);

    cy.contains('import-mock.xlsx');

    cy.get('[data-testid="import-button"]').click();

    cy.wait('@importValidCustomers');

    cy.contains(`Importation effectuée avec succès.`);
  });
});
