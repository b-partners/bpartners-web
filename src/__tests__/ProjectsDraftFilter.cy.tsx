import App from '@/App';
import { accountHolders1, accounts1, whoami1 } from './mocks/responses';

describe('Projects draft filter wiring', () => {
  beforeEach(() => {
    cy.cognitoLogin();
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
  });

  it('loads the list unfiltered then refetches with the committed filter', () => {
    cy.intercept('GET', `/accounts/${accounts1[0].id}/annotations/drafts**`, []).as('getDrafts');
    cy.mount(<App />);
    cy.waitAuthRequestNeeded();

    cy.get('[name="projects"]').click();
    cy.wait('@getDrafts').its('request.url').should('not.include', 'prospectName=');

    cy.intercept('GET', `/accounts/${accounts1[0].id}/annotations/drafts**`, req => {
      expect(req.url).to.include('prospectName=Jane');
      req.reply([]);
    }).as('getFilteredDrafts');

    cy.get('[data-cy="draft-filter-input"]').type('Jane');
    cy.get('[data-cy="draft-filter-search-button"]').click();

    cy.wait('@getFilteredDrafts');
  });
});
