import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '@/App';

import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
import { getProducts, resetProducts, setProduct } from './mocks/responses/product-api';
import { whoami1 } from './mocks/responses/security-api';

const DESCRIPTION_FILTER = 'test description';
const PRICE_FILTER = 100;

/**
 * The list's filters are debounced, so a keystroke can send a request carrying only part of what was
 * typed. Asserting on the settled request — rather than inside a route handler, where a late failure
 * lands outside whatever test is running — is what makes the filter assertions deterministic.
 */
const settledRequest = alias =>
  cy.get(`${alias}.all`).should(calls => {
    expect(calls, 'the list sent at least one request').to.have.length.greaterThan(0);
    const { query } = calls[calls.length - 1].request;
    expect(query.descriptionFilter).to.eq(DESCRIPTION_FILTER);
    expect(+query.priceFilter).to.eq(PRICE_FILTER * 100);
  });

const openProducts = (accountHolderAlias = '@getAccountHolder1') => {
  cy.mount(<App />);
  cy.get('[name="products"]').click();
  cy.wait('@whoami');
  cy.wait('@getUser1');
  cy.wait('@getAccounts1');
  cy.wait(accountHolderAlias);
  cy.wait('@getProducts');
};

const row = index => cy.get('.MuiTableBody-root > tr').eq(index);

describe(specTitle('Products'), () => {
  beforeEach(() => {
    resetProducts();

    cy.cognitoLogin();

    cy.intercept('GET', '/accounts/mock-account-id1/customers', customers1).as('getCustomers');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccounts1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', /^\/accounts\/mock-account-id1\/products(\?.*)?$/, req => {
      const { page, pageSize } = req.query;
      req.reply(getProducts(page - 1, pageSize));
    }).as('getProducts');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products/**`, req => {
      req.reply({ ...getProducts(0, 1)[0], id: req.url.split('products/')[1] });
    }).as('getOneProduct');
    cy.intercept('POST', `/accounts/mock-account-id1/products`, req => {
      req.reply(req.body);
    }).as('postProducts');
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/products/status`, getProducts(0, 2)).as('archiveProduct');
  });

  it('are displayed', () => {
    openProducts();

    cy.contains('description 1');
    cy.contains('description 2');
    cy.contains('description 3');
    cy.contains('12,00 €');

    cy.intercept('GET', /^\/accounts\/mock-account-id1\/products\?.*descriptionFilter=/, req => {
      const { page, pageSize } = req.query;
      req.reply(getProducts(page - 1, pageSize));
    }).as('filteredProducts');

    cy.get('[name="descriptionFilter"]').type(DESCRIPTION_FILTER);
    cy.get('[name="priceFilter"]').type(`${PRICE_FILTER}`);
    settledRequest('@filteredProducts');

    cy.get('.column-description').find('.MuiTableSortLabel-root').click();
    settledRequest('@filteredProducts');

    cy.get('.column-unitPrice').find('.MuiTableSortLabel-root').click();
    settledRequest('@filteredProducts');
  });

  it('Should test pagination', () => {
    openProducts();

    cy.contains('description 1');
    cy.contains('description 2');
    cy.contains('description 14');

    cy.get(`div .MuiSelect-select`).click();
    cy.get('[data-value="10"]').click();

    cy.contains('description 1');
    cy.contains('description 9');
    cy.contains('description 14').should('not.exist');
  });

  it('should validate empty input', () => {
    openProducts();

    cy.contains('description 1');

    cy.get('[data-testid="create-button"]').click();

    cy.get('[name="description"]').type('test description').blur();

    cy.get('.RaToolbar-defaultToolbar > .MuiButtonBase-root').click();
    cy.contains('Ce champ est requis');
  });

  it('should create well-defined product', () => {
    openProducts();

    cy.contains('description 1');

    cy.get('[data-testid="create-button"]').click();

    cy.get('[name="description"]').type('new description');
    cy.get('[name="unitPrice"]').type(1.03);
    cy.get('[name="vatPercent"]').type(5);

    let newProduct;
    cy.intercept('POST', `/accounts/mock-account-id1/products`, req => {
      newProduct = [{ ...req.body[0], id: 'new-product-id', status: 'ENABLED' }];
      req.reply(newProduct);
    }).as('postNewProduct');

    cy.get('.RaToolbar-defaultToolbar > .MuiButtonBase-root').click();
    cy.wait('@postNewProduct')
      .its('request.body')
      .should('deep.eq', [
        {
          unitPrice: 10300,
          vatPercent: 500,
          description: 'new description',
          quantity: 1,
          totalPriceWithVat: null,
          totalVat: null,
          unitPriceWithVat: null,
        },
      ]);

    cy.intercept('GET', `/accounts/${accounts1[0].id}/products?**`, req => {
      const { page, pageSize } = req.query;
      req.reply([...newProduct, ...getProducts(page - 1, pageSize)]);
    }).as('getProductsWithNew');
    cy.get('[data-testid="pagination-left-id"]').click();
    cy.contains('new description');
    cy.contains('103,00 €');
  });

  it('Should edit a product', () => {
    const editionDescription = 'edit this product test';
    const editedProduct = [
      {
        description: editionDescription,
        unitPrice: 100,
        vatPercent: 100,
        id: 'product-0-id',
        quantity: 1,
        totalPriceWithVat: null,
        totalVat: null,
        unitPriceWithVat: null,
      },
    ];

    openProducts();

    cy.contains('description 1');

    row(0).find('.column-description').click();
    cy.contains('Édition de produit');

    cy.intercept('GET', '/accounts/mock-account-id1/products/product-0-id', { ...getProducts(1, 1)[0], id: 'product-0-id' }).as('getEditedProduct');
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/products`, req => {
      setProduct(editedProduct[0], 0);
      req.reply(editedProduct);
    }).as('putProduct');

    cy.get('[name="description"]').clear().type(editionDescription);
    cy.get('[name="unitPrice"]').clear().type(1);
    cy.get('[name="vatPercent"]').clear().type(1);
    cy.contains('Enregistrer').click();

    cy.wait('@putProduct').its('request.body').should('deep.eq', editedProduct);
    cy.contains(editionDescription);
  });

  it('VAT references should not displayed', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, req => {
      const accountHolder = { ...accountHolders1[0] };
      accountHolder.companyInfo.isSubjectToVat = false;

      req.reply({
        body: [{ ...accountHolder }],
      });
    }).as('getAccountHolder2');

    openProducts('@getAccountHolder2');

    cy.contains(/TVA/gi).should('not.exist');
    cy.contains(/TTC/gi).should('not.exist');

    cy.get('[data-testid="create-button"]').click();

    cy.contains(/TVA/gi).should('not.exist');
    cy.contains(/TTC/gi).should('not.exist');
  });

  it('Should exit of the edit or create node on click on the close button', () => {
    openProducts();

    cy.contains('description 1');

    cy.get('[data-testid="create-button"]').click();

    cy.contains('Création de produit');
    cy.get("[data-testid='closeIcon']").click();
    cy.contains('Création de produit').should('not.exist');
    cy.contains('Page : 1');
  });

  it('Should archive product', () => {
    openProducts();

    cy.get('[data-testid="archive-products-button"]').should('not.exist');
    row(0).find('.MuiTableCell-paddingCheckbox input').click();
    cy.get('[data-testid="archive-products-button"]').should('exist');
    row(1).find('.MuiTableCell-paddingCheckbox input').click();
    cy.get('[data-testid="archive-products-button"]').click();

    cy.contains('Les produits suivants vont être archivés :');
    cy.contains('description 0');
    cy.contains('description 1');

    cy.get('[data-testid="submit-archive-products"]').click();
    cy.wait('@archiveProduct')
      .its('request.body')
      .should('deep.eq', [
        { id: 'product-0-id', status: 'DISABLED' },
        { id: 'product-1-id', status: 'DISABLED' },
      ]);
    cy.get('[data-testid="archive-products-button"]').should('not.exist');
    cy.contains('Produits archivés avec succès');

    row(0).find('.column-description').click();
    cy.contains('Édition de produit');
    cy.get('[data-testid="submit-archive-products"]').click();
    cy.wait('@archiveProduct');
    cy.contains('Produit archivé avec succès');
  });
});
