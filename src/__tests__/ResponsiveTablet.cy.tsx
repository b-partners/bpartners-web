import App from '@/App';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { getCustomers } from './mocks/responses/customer-api';
import { whoami1 } from './mocks/responses/security-api';

const TABLET = { viewportWidth: 768, viewportHeight: 1024 };

describe('Responsive tablet', () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/accounts/${accounts1[0].id}/customers?**`, req => {
      const page = Number(req.query.page);
      const pageSize = Number(req.query.pageSize);
      req.reply(getCustomers(page - 1, pageSize));
    });
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
  });

  it('keeps the sidebar hidden and opens it as an overlay from the app bar', TABLET, () => {
    cy.mount(<App />);
    cy.get('[name="customers"]').should('not.be.visible');
    cy.get('[data-testid="MenuIcon"]').first().click();
    cy.get('[name="customers"]').should('be.visible');
  });

  it('renders the customers list as cards instead of a datagrid on tablet', TABLET, () => {
    cy.mount(<App />);
    cy.get('[data-testid="MenuIcon"]').first().click();
    cy.get('[name="customers"]').click();

    cy.contains('lastName-0 firstName-0').should('be.visible');
    cy.get('.MuiTable-root').should('not.exist');
  });
});
