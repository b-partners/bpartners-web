import App from '@/App';
import { accountHolders1, accounts1, whoami1 } from './mocks/responses';

describe('Home', () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    const carreleurs = [{ ...accountHolders1[0], businessActivities: { primary: 'Couvreur' } }];
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, carreleurs).as('getAccountHolder1');

    cy.intercept('GET', '**/prospects**', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Jean Dupont', address: '12 rue du toit' },
        { id: 2, name: 'Toiture Express', address: '15 avenue Zinc' },
        { id: 3, name: 'SARL Ardoise', address: '23 chemin des tuiles' },
        { id: 4, name: 'Le Couvreur Malin', address: '8 rue du zinc' },
        { id: 5, name: 'TopToiture', address: '17 allée de l’étanchéité' },
        { id: 6, name: 'Couvreur du coin', address: '3 impasse du faîtage' },
      ],
    }).as('getProspects');

    cy.mount(<App />);
    cy.getByName('home').click();
    cy.wait('@getProspects');
  });

  it('displays the list of prospects', () => {
    cy.contains('Bienvenue sur le dashboard de Birdia');

    cy.contains('Jean Dupont');
    cy.contains('12 rue du toit');
    cy.contains('Toiture Express');
    cy.contains('15 avenue Zinc');
    cy.contains('SARL Ardoise');
    cy.contains('23 chemin des tuiles');
    cy.contains('Le Couvreur Malin');
    cy.contains('8 rue du zinc');
    cy.contains('TopToiture');
    cy.contains('17 allée de l’étanchéité');
    cy.contains('Couvreur du coin');
    cy.contains('3 impasse du faîtage');

    cy.get('img').should('exist');
    cy.get('img[alt="Image de la maison"]').should('exist');

    cy.dataCy('add-address').click().type('753 Routes de Saint Lyphard');
    cy.contains("Passer à l'analyse");
    cy.dataCy('button-analyze').should('have.attr', 'data-path', '/prospects');

    cy.contains('Prospects');
    cy.dataCy('title-prospects').should('have.attr', 'data-path', '/prospects');
    cy.dataCy('add-prospects').should('have.attr', 'data-path', '/prospects');
    cy.contains('Clients');
    cy.dataCy('title-customers').should('have.attr', 'data-path', '/customers');
    cy.dataCy('add-customers').should('have.attr', 'data-path', '/customers/create');
    cy.contains('Produits');
    cy.dataCy('title-products').should('have.attr', 'data-path', '/products');
    cy.dataCy('add-products').should('have.attr', 'data-path', '/products/create');
    cy.contains('Devis');
    cy.dataCy('title-invoices-1').should('have.attr', 'data-path', '/invoices');
    cy.dataCy('add-invoices-1').should('have.attr', 'data-path', '/invoices?showCreateQuote=true');
    cy.contains('Factures');
    cy.dataCy('title-invoices-2').should('have.attr', 'data-path', '/invoices');
    cy.dataCy('add-invoices-2').should('have.attr', 'data-path', '/invoices?showCreateQuote=true');
  });
});
