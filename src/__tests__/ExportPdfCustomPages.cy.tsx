import { ExportPdfConfDialog } from '@/operations/annotator/components/export-pdf-conf-dialog';

const fieldByLabel = (label: string) => cy.contains('label', label).parent();

describe('Supplementary pages in the PDF export dialog', () => {
  it('exports without custom pages when none are added', () => {
    cy.mount(<ExportPdfConfDialog onConfirm={cy.stub().as('onConfirm')} />);

    cy.get('[data-testid="export-pdf-conf-confirm"]').click();

    cy.get('@onConfirm').should('have.been.calledOnce').its('firstCall.args.0.customPages').should('deep.equal', []);
  });

  it('keeps the page unsaveable until it has a title and a filled section', () => {
    cy.mount(<ExportPdfConfDialog onConfirm={cy.stub().as('onConfirm')} />);

    cy.get('[data-testid="add-custom-page"]').click();
    cy.get('[data-testid="custom-page-save"]').should('be.disabled');

    fieldByLabel('Titre de la page').find('input').type('Observations de chantier');
    cy.get('[data-testid="custom-page-save"]').should('be.disabled');

    cy.contains('button', 'Ajouter une section').click();
    cy.contains('li', 'Texte').click();
    cy.get('[data-testid="custom-page-save"]').should('be.disabled');

    fieldByLabel('Texte').find('textarea').first().type('Echafaudage requis sur le pan Nord.');
    cy.get('[data-testid="custom-page-save"]').should('be.enabled');
  });

  it('adds a page and hands it to the export payload', () => {
    cy.mount(<ExportPdfConfDialog onConfirm={cy.stub().as('onConfirm')} />);

    cy.get('[data-testid="add-custom-page"]').click();
    fieldByLabel('Titre de la page').find('input').type('Observations de chantier');
    cy.contains('button', 'Ajouter une section').click();
    cy.contains('li', 'Texte').click();
    fieldByLabel('Texte').find('textarea').first().type('Echafaudage requis sur le pan Nord.');
    cy.get('[data-testid="custom-page-save"]').click();

    cy.contains('Observations de chantier').should('be.visible');
    cy.contains('1 section').should('be.visible');

    cy.get('[data-testid="export-pdf-conf-confirm"]').click();

    cy.get('@onConfirm')
      .should('have.been.calledOnce')
      .its('firstCall.args.0.customPages')
      .should('deep.equal', [
        {
          pageTitle: 'Observations de chantier',
          sections: [{ type: 'TEXT', priority: 'MEDIUM', text: 'Echafaudage requis sur le pan Nord.' }],
        },
      ]);
  });

  it('removes a page from the list', () => {
    cy.mount(<ExportPdfConfDialog onConfirm={cy.stub().as('onConfirm')} />);

    cy.get('[data-testid="add-custom-page"]').click();
    fieldByLabel('Titre de la page').find('input').type('Page a supprimer');
    cy.contains('button', 'Ajouter une section').click();
    cy.contains('li', 'Texte').click();
    fieldByLabel('Texte').find('textarea').first().type('Contenu.');
    cy.get('[data-testid="custom-page-save"]').click();

    cy.get('[aria-label="Supprimer Page a supprimer"]').click();
    cy.contains('Page a supprimer').should('not.exist');

    cy.get('[data-testid="export-pdf-conf-confirm"]').click();
    cy.get('@onConfirm').its('firstCall.args.0.customPages').should('deep.equal', []);
  });
});
