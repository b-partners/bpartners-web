import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '@/App';

import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { exportAllProducts, products } from './mocks/responses/product-api';
import { user1, whoami1 } from './mocks/responses/security-api';

describe(specTitle('Import Products'), () => {
  beforeEach(() => {
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getAccount1');

    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products**`, products).as('getAllProducts');
  });

  it('Import wrong products file', () => {
    cy.intercept('POST', `/accounts/${accounts1[0].id}/products/upload`, req => {
      req.reply({
        statusCode: 400,
        body: {
          message: errorMessage,
        },
      });
    }).as('importWrongProductsFile');
    cy.mount(<App />);
    cy.get('[name="products"]').click();
    cy.wait('@getAllProducts');

    cy.get('[data-testid="import-modal-button"]').click();

    cy.contains('Importer des produits');
    cy.contains('Pour importer une liste de vos produits, le fichier Excel (.xls ou .xlsx) contenant la liste doit suivre le modèle suivant :');
    cy.contains(`Veuillez à ce que votre fichier soit structuré comme le modèle avant de l'importer.`);
    cy.contains(`Ou mieux encore, téléchargez ce modèle et copiez vos produits pour être sûr que les colonnes correspondent.`);

    const _path = 'cypress/fixtures';
    const _mockFile = `${_path}/import-mock.xlsx`;
    const errorMessage =
      '"Description" instead of "Nom" at column 1. "Quantité" instead of "Prénom(s)" at column 2. "Prix unitaire" instead of "Email" at column 3. "TVA (%)" instead of "Téléphone" at the last column.';

    cy.get('#upload-file-label').should('be.visible').selectFile(_mockFile);

    cy.contains('import-mock.xlsx');

    cy.get('[data-testid="import-button"]').click();

    cy.wait('@importWrongProductsFile');

    cy.contains('Importation en cours...');

    cy.contains(`Une erreur s'est produite lors de l'importation.`);

    cy.contains(`Les colonnes suivantes ne correspondent pas :`);
    cy.contains(`"Description" à la place de "Nom" à la colonne 1`);
    cy.contains(`"Quantité" à la place de "Prénom(s)" à la colonne 2`);
    cy.contains(`"Prix unitaire" à la place de "Email" à la colonne 3`);
    cy.contains(`"TVA (%)" à la place de "Téléphone" à la dernière colonne.`);

    cy.get('[data-testid="CancelIcon"]').click();

    cy.contains('import-mock.xlsx').should('not.exist');

    cy.contains(`Les colonnes suivantes ne correspondent pas :`).should('not.exist');
  });

  it('Import valid products file', () => {
    cy.intercept('POST', `/accounts/${accounts1[0].id}/products/upload`, products).as('importValidProductsFile');
    cy.mount(<App />);
    cy.get('[name="products"]').click();
    cy.wait('@getAllProducts');

    cy.get('[data-testid="import-modal-button"]').click();

    cy.contains('Importer des produits');
    cy.contains('Pour importer une liste de vos produits, le fichier Excel (.xls ou .xlsx) contenant la liste doit suivre le modèle suivant :');
    cy.contains(`Veuillez à ce que votre fichier soit structuré comme le modèle avant de l'importer.`);
    cy.contains(`Ou mieux encore, téléchargez ce modèle et copiez vos produits pour être sûr que les colonnes correspondent.`);

    const _path = 'cypress/fixtures';
    const _mockFile = `${_path}/import-mock.xlsx`;

    cy.get('#upload-file-label').should('be.visible').selectFile(_mockFile);

    cy.contains('import-mock.xlsx');

    cy.get('[data-testid="import-button"]').click();

    cy.wait('@importValidProductsFile');

    cy.contains(`Importation effectuée avec succès.`);
  });

  it('Error when exporting all products in CSV file', () => {
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products/export`, req => {
      req.reply({
        statusCode: 400,
      });
    }).as('errorExportAllProducts');

    cy.mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="products"]').click();
    cy.get('[data-testid="export-button-products"]').click();
    cy.contains(`Une erreur s'est produite lors de l'exportation.`);
  });
  it('Export all products in CSV file', () => {
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products/export`, exportAllProducts).as('validExportAllProducts');

    cy.mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="products"]').click();
    cy.get('[data-testid="export-button-products"]').click();
    cy.contains('Exportation effectuée avec succès');
  });
});
