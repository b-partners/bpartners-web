import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import * as Redirect from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1, customers2, getCustomers, setCustomer } from './mocks/responses/customer-api';
import { whoami1 } from './mocks/responses/security-api';

describe(specTitle('Customers'), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/accounts/${accounts1[0].id}/customers?**`, req => {
      const { page, pageSize } = req.query;
      req.reply(getCustomers(page - 1, pageSize));
    });
    cy.intercept('GET', `/accounts/${accounts1[0].id}/customers/customer-0-id`, req => {
      req.reply(getCustomers(0, 1)[0]);
    });
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');

    cy.intercept('POST', '/accounts/mock-account-id1/customers**', [customers1[0]]).as('createCustomers');
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/customers/status`, [customers1[0]]).as('archiveCustomer');

    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('Should create customer', () => {
    cy.intercept('POST', '/accounts/mock-account-id1/customers**', req => {
      const newCustomer = {
        address: 'Wall Street 2',
        comment: 'comment',
        email: 'test@gmail.com',
        firstName: 'FirstName 11',
        lastName: 'LastName 11',
        phone: '55 55 55',
      };

      expect(req.body[0]).to.deep.eq(newCustomer);
      req.reply([customers2[3]]);
    }).as('modifyCustomers');

    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="customers"]').click();

    cy.contains('Email');

    cy.get('[data-testid="create-button"]').click();

    cy.get('#email').type('invalid email{enter}');
    cy.contains('Doit être un email valide');

    cy.get('#email').clear().type('test@gmail.com{enter}');
    cy.contains('Ce champ est requis');

    cy.get('#lastName').type('LastName 11');
    cy.intercept('GET', '/accounts/mock-account-id1/customers?page=1&pageSize=15', customers2).as('getCustomers2');
    cy.get('#firstName').type('FirstName 11');
    cy.get('#address').type('Wall Street 2');
    cy.get('#comment').type('comment');
    cy.get('#phone').type('55 55 55{enter}');

    cy.wait('@modifyCustomers');

    cy.get('[data-testid="create-button"]').click();
    cy.get("[data-testid='closeIcon']").click();
    cy.contains('Création de client').should('not.exist');
    cy.contains('Page : 1');
  });

  it('Should edit a customer', () => {
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="customers"]').click();
    cy.contains('Email');
    cy.get('.MuiTableBody-root > :nth-child(1) > .column-firstName').click();
    cy.contains('Édition de client');

    cy.get('#email').type('invalid email{enter}');
    cy.contains('Doit être un email valide');

    cy.intercept('PUT', '/accounts/mock-account-id1/customers**', req => {
      const updatedCustomer = {
        address: 'Wall Street 2',
        comment: null,
        email: 'test@gmail.com',
        firstName: 'FirstName 11',
        id: 'customer-0-id',
        lastName: 'LastName 11',
        phone: '55 55 55',
      };
      expect(req.body[0]).to.deep.eq(updatedCustomer);
      setCustomer(0, updatedCustomer);
      req.reply([updatedCustomer]);
    }).as('updateCustomers');

    cy.get('#email').clear();
    cy.get('#email').type('test@gmail.com');

    cy.get('#lastName').clear().type('LastName 11');
    cy.get('#firstName').clear().type('FirstName 11');
    cy.get('#address').clear().type('Wall Street 2');
    cy.get('#comment').contains('comment customer 1');
    cy.get('#comment').clear();
    cy.get('#phone').clear().type('55 55 55{enter}');

    cy.wait('@updateCustomers');

    cy.contains('Wall Street 2');
    cy.contains('LastName 11');
    cy.contains('FirstName 11');
    cy.contains('test@gmail.com');
    cy.contains('55 55 55');

    cy.get('.MuiTableBody-root > :nth-child(1) > .column-firstName').click();
    cy.get("[data-testid='closeIcon']").click();

    cy.contains('Édition de client').should('not.exist');
    cy.contains('Page : 1');
  });

  it('Should archive customer', () => {
    mount(<App />);

    cy.get('[name="customers"]').click();

    cy.get('[data-testid="archive-customers-button"]').should('not.exist');
    cy.get('.MuiTableBody-root > :nth-child(1) > .MuiTableCell-paddingCheckbox > .MuiButtonBase-root > .PrivateSwitchBase-input').click();
    cy.get('[data-testid="archive-customers-button"]').should('exist');
    cy.get(':nth-child(2) > .MuiTableCell-paddingCheckbox > .MuiButtonBase-root > .PrivateSwitchBase-input').click();
    cy.get('[data-testid="archive-customers-button"]').click();

    cy.contains('Les clients suivants vont être archivés :');
    cy.contains('LastName 11 FirstName 11');
    cy.contains('lastName-1 firstName-1');
    cy.get('[data-testid="submit-archive-customers"]').click();
    cy.wait('@archiveCustomer').then(res => {
      const expectedPayload = [
        { id: 'customer-0-id', status: 'DISABLED' },
        { id: 'customer-1-id', status: 'DISABLED' },
      ];

      const body = res.request.body;
      expect(body).to.deep.eq(expectedPayload);
    });
    cy.get('[data-testid="archive-customers-button"]').should('not.exist');
    cy.contains('Clients archivés avec succès');
  });

  it('Should display customer list', () => {
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="customers"]').click();

    cy.contains('2589 Nelm Street');
    cy.contains('lastName-1');
    cy.contains('firstName-1');

    cy.get('[data-testid="customer-filter-accordion"]').click();

    const testLastName = 'Doe';
    cy.get('input[name="lastName"]').type(testLastName);

    const testFirstName = 'John';
    cy.get('input[name="firstName"]').type(testFirstName);

    const testEmail = 'doe@gmail.com';
    cy.get('input[name="email"]').type(testEmail);

    const testPhoneNumber = 1234567;
    cy.get('input[name="phoneNumber"]').type(testPhoneNumber);

    const testCity = 'Paris';
    cy.get('input[name="city"]').type(testCity);

    const testCountry = 'France';
    cy.get('input[name="country"]').type(testCountry);

    cy.intercept('GET', `/accounts/${accounts1[0].id}/customers**`, req => {
      const { page, pageSize, lastName, firstName, email, phoneNumber, city, country } = req.query;
      expect(lastName).to.be.eq(testLastName);
      expect(firstName).to.be.eq(testFirstName);
      expect(email).to.be.eq(testEmail);
      expect(+phoneNumber).to.be.eq(testPhoneNumber);
      expect(city).to.be.eq(testCity);
      expect(country).to.be.eq(testCountry);

      req.reply(getCustomers(page - 1, pageSize));
    }).as('getCustomersFilter');
    cy.wait('@getCustomersFilter');
  });
});
