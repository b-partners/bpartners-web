import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
import { getProducts, setProduct } from './mocks/responses/product-api';
import { user1, whoami1 } from './mocks/responses/security-api';

describe(specTitle('Products'), () => {
  beforeEach(() => {
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getAccount1');

    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', '/accounts/mock-account-id1/customers', customers1).as('getCustomers');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products?**`, req => {
      const { page, pageSize } = req.query;
      req.reply(getProducts(page - 1, pageSize));
    }).as('getProducts');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products/**`, req => {
      req.reply({ ...getProducts(0, 1)[0], id: 'product-15-id' });
    }).as('getOneProduct');
    cy.intercept('POST', `/accounts/mock-account-id1/products`, req => {
      req.reply(req.body);
    }).as('postProducts');
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/products/status`, getProducts(0, 2)).as('archiveProduct');
  });

  it('are displayed', () => {
    mount(<App />);
    cy.get('[name="products"]').click();
    cy.contains('description 1');
    cy.contains('description 2');
    cy.contains('description 3');
    cy.contains('12,00 €');

    const descriptionFilterTest = 'test description';
    const priceFilterTest = 100;

    cy.get('#descriptionFilter').type(descriptionFilterTest);
    cy.get('#priceFilter').type(priceFilterTest);
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products**`, req => {
      const { page, pageSize, descriptionFilter, priceFilter } = req.query;
      expect(descriptionFilter).to.be.eq(descriptionFilterTest);
      expect(+priceFilter).to.be.eq(priceFilterTest * 100);
      req.reply(getProducts(page - 1, pageSize));
    }).as('getCustomersFilterByUnitPrice');
    cy.wait('@getCustomersFilterByUnitPrice');

    cy.intercept('GET', `/accounts/${accounts1[0].id}/products**`, req => {
      const { page, pageSize, descriptionFilter, priceFilter, descriptionOrder } = req.query;
      expect(descriptionFilter).to.be.eq(descriptionFilterTest);
      expect(+priceFilter).to.be.eq(priceFilterTest * 100);
      expect(descriptionOrder).to.be.eq('ASC');
      req.reply(getProducts(page - 1, pageSize));
    }).as('getCustomersSortByDescription');
    cy.get('.column-description > .MuiButtonBase-root > span').click();

    cy.intercept('GET', `/accounts/${accounts1[0].id}/products**`, req => {
      const { page, pageSize, descriptionFilter, priceFilter, unitPriceOrder } = req.query;
      expect(descriptionFilter).to.be.eq(descriptionFilterTest);
      expect(+priceFilter).to.be.eq(priceFilterTest * 100);
      expect(unitPriceOrder).to.be.eq('ASC');
      req.reply(getProducts(page - 1, pageSize));
    }).as('getCustomersSortByUnitPrice');
    cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(3)').click();
  });

  it('Should test pagination', () => {
    mount(<App />);
    cy.get('[name="products"]').click();
    cy.contains('description 1');
    cy.contains('description 2');
    cy.contains('description 14');

    cy.get(`div .MuiSelect-select`).click();
    cy.get('[data-value="10"]').click();

    cy.contains('description 1');
    cy.contains('description 9');
    cy.contains('description 14').not();
    cy.contains('Page : 1 / 2');

    cy.get('[data-testid="pagination-left-id"]').click();

    cy.contains('description 10');
    cy.contains('description 16');
    cy.contains('Page : 2 / 2');
  });

  it('should validate empty input', () => {
    mount(<App />);
    cy.get('[name="products"]').click();

    cy.wait('@getAccount1');
    cy.wait('@whoami');
    cy.wait('@getAccountHolder1');
    cy.wait('@getProducts');

    cy.contains('description 1');

    cy.get('[data-testid="create-button"]').click();

    cy.get('#description').type('test description').blur();

    cy.get('.RaToolbar-defaultToolbar > .MuiButtonBase-root').click();
    cy.contains('Ce champ est requis');
  });

  it('should create well-defined product', () => {
    mount(<App />);

    cy.get('[name="products"]').click();

    cy.wait('@getAccount1');
    cy.wait('@whoami');
    cy.wait('@getAccountHolder1');
    cy.wait('@getProducts');

    cy.contains('description 1');

    cy.get('[data-testid="create-button"]').click();

    cy.get('#description').type('new description');
    cy.get('#unitPrice').type(1.03);
    cy.get('#vatPercent').type(5);

    cy.intercept('POST', `/accounts/mock-account-id1/products`, req => {
      expect(req.body).to.deep.eq([
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
      setProduct(req.body[0]);
    }).as('postNewProduct');
    cy.get('.RaToolbar-defaultToolbar > .MuiButtonBase-root').click();
    cy.wait('@postNewProduct');
    cy.get('[data-testid="pagination-left-id"]').click();
    cy.contains('new description');
    cy.contains('103,00 €');
  });

  it('Should edit a product', () => {
    mount(<App />);

    cy.get('[name="products"]').click();

    cy.wait('@getAccount1');
    cy.wait('@whoami');
    cy.wait('@getAccountHolder1');
    cy.wait('@getProducts');

    cy.contains('description 1');

    cy.get('.MuiTableBody-root > :nth-child(1) > .column-description').click();
    cy.contains('Édition de produit');

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/products`, req => {
      const editedProduct = [
        {
          description: editionDescription,
          unitPrice: 100,
          vatPercent: 100,
          id: 'product-15-id',
          quantity: 1,
          totalPriceWithVat: null,
          totalVat: null,
          unitPriceWithVat: null,
        },
      ];
      expect(req.body).to.deep.equals(editedProduct);
      setProduct(editedProduct[0], 0);
      req.reply(editedProduct);
    });

    const editionDescription = 'edit this product test';
    cy.get('#description').clear().type(editionDescription);
    cy.get('#unitPrice').clear().type(1);
    cy.get('#vatPercent').clear().type(1);
    cy.get('.RaToolbar-defaultToolbar > .MuiButton-contained').click();

    cy.contains('edit this product test');
  });

  it('VAT references should not displayed', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, req => {
      // make isSubjectToVat = false
      const accountHolder = { ...accountHolders1[0] };
      accountHolder.companyInfo.isSubjectToVat = false;

      req.reply({
        body: [{ ...accountHolder }],
      });
    }).as('getAccountHolder2');

    mount(<App />);
    cy.get('[name="products"]').click();

    cy.wait('@getAccount1');
    cy.wait('@whoami');
    cy.wait('@getAccountHolder2');
    cy.wait('@getProducts');

    cy.contains(/TVA/gi).should('not.exist');
    cy.contains(/TTC/gi).should('not.exist');

    cy.get('[data-testid="create-button"]').click();

    cy.contains(/TVA/gi).should('not.exist');
    cy.contains(/TTC/gi).should('not.exist');
  });

  it('Should exit of the edit or create node on click on the close button', () => {
    mount(<App />);

    cy.get('[name="products"]').click();

    cy.wait('@getAccount1');
    cy.wait('@whoami');
    cy.wait('@getAccountHolder1');
    cy.wait('@getProducts');

    cy.contains('description 1');

    cy.get('[data-testid="create-button"]').click();

    cy.contains('Création de produit');
    cy.get("[data-testid='closeIcon']").click();
    cy.contains('Création de produit').should('not.exist');
    cy.contains('Page : 1');
  });

  it('Should archive product', () => {
    mount(<App />);

    cy.get('[name="products"]').click();

    cy.get('[data-testid="archive-products-button"]').should('not.exist');
    cy.get('.MuiTableBody-root > :nth-child(1) > .MuiTableCell-paddingCheckbox > .MuiButtonBase-root > .PrivateSwitchBase-input').click();
    cy.get('[data-testid="archive-products-button"]').should('exist');
    cy.get(':nth-child(2) > .MuiTableCell-paddingCheckbox > .MuiButtonBase-root > .PrivateSwitchBase-input').click();
    cy.get('[data-testid="archive-products-button"]').click();

    cy.contains('Les produits suivants vont être archivés :');
    cy.contains('edit this product test');
    cy.contains('description 1');

    cy.get('[data-testid="submit-archive-products"]').click();
    cy.wait('@archiveProduct').then(res => {
      const expectedPayload = [
        { id: 'product-15-id', status: 'DISABLED' },
        { id: 'product-1-id', status: 'DISABLED' },
      ];
      const body = res.request.body;
      expect(body).to.deep.eq(expectedPayload);
    });
    cy.get('[data-testid="archive-products-button"]').should('not.exist');
    cy.contains('Produits archivés avec succès');
  });
});
