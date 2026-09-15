import { useAnnotatorComponentStore } from '@/common/store';
import { ExportPdfConfDialog } from '@/operations/annotator/components/export-pdf-conf-dialog';

const TITLE_PLACEHOLDER = 'Titre de la page';
const TEXT_PLACEHOLDER = 'Saisissez votre texte…';
const URL_PLACEHOLDER = "Collez l'URL de l'image puis appuyez sur Entrée";

const addBlock = (label: string) => {
  cy.get('[data-testid="add-custom-page-block"]').click();
  cy.contains('li', label).click();
};

describe('Supplementary pages in the PDF export dialog', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    useAnnotatorComponentStore.getState().reset();
    cy.mount(<ExportPdfConfDialog onConfirm={cy.stub().as('onConfirm')} />);
  });

  it('exports without custom pages when none are added', () => {
    cy.get('[data-testid="export-pdf-conf-confirm"]').click();

    cy.get('@onConfirm').should('have.been.calledOnce').its('firstCall.args.0.customPages').should('deep.equal', []);
  });

  it('keeps the page unsaveable until it has a title and a filled block', () => {
    cy.get('[data-testid="add-custom-page"]').click();
    cy.get('[data-testid="custom-page-save"]').should('be.disabled');

    cy.get(`[placeholder="${TITLE_PLACEHOLDER}"]`).type('Observations de chantier');
    cy.get('[data-testid="custom-page-save"]').should('be.disabled');

    addBlock('Texte');
    cy.get('[data-testid="custom-page-save"]').should('be.disabled');

    cy.get(`[placeholder="${TEXT_PLACEHOLDER}"]`).type('Echafaudage requis sur le pan Nord.');
    cy.get('[data-testid="custom-page-save"]').should('be.enabled');
  });

  it('fills a text block on the page sheet and hands it to the export payload', () => {
    cy.get('[data-testid="add-custom-page"]').click();
    cy.get(`[placeholder="${TITLE_PLACEHOLDER}"]`).type('Observations de chantier');
    addBlock('Texte');
    cy.get(`[placeholder="${TEXT_PLACEHOLDER}"]`).type('Echafaudage requis sur le pan Nord.');
    cy.get('[data-testid="custom-page-save"]').click();

    cy.contains('.page-row', 'Observations de chantier').scrollIntoView().should('be.visible').and('contain.text', '1 section');

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

  it('turns the image placeholder box into a picture once an url is given', () => {
    const url = 'https://storage.test/photo.jpg';

    cy.get('[data-testid="add-custom-page"]').click();
    cy.get(`[placeholder="${TITLE_PLACEHOLDER}"]`).type('Reportage photo');
    addBlock('Image');

    cy.get('[aria-label="Ajouter une image par URL"]').should('be.visible').click();
    cy.get(`[placeholder="${URL_PLACEHOLDER}"]`).type(`${url}{enter}`);

    cy.get('.image-preview').should('have.attr', 'src', url);
    cy.get('[data-testid="custom-page-save"]').click();

    cy.get('[data-testid="export-pdf-conf-confirm"]').click();

    cy.get('@onConfirm')
      .its('firstCall.args.0.customPages')
      .should('deep.equal', [{ pageTitle: 'Reportage photo', sections: [{ type: 'IMAGE', priority: 'MEDIUM', url, caption: '' }] }]);
  });

  it('restores the pages when the export dialog is reopened', () => {
    cy.get('[data-testid="add-custom-page"]').click();
    cy.get(`[placeholder="${TITLE_PLACEHOLDER}"]`).type('Observations de chantier');
    addBlock('Texte');
    cy.get(`[placeholder="${TEXT_PLACEHOLDER}"]`).type('Echafaudage requis sur le pan Nord.');
    cy.get('[data-testid="custom-page-save"]').click();

    cy.mount(<ExportPdfConfDialog onConfirm={cy.stub().as('onReopened')} />);

    cy.contains('.page-row', 'Observations de chantier').should('exist');

    cy.get('[data-testid="export-pdf-conf-confirm"]').click();
    cy.get('@onReopened')
      .its('firstCall.args.0.customPages')
      .should('deep.equal', [
        {
          pageTitle: 'Observations de chantier',
          sections: [{ type: 'TEXT', priority: 'MEDIUM', text: 'Echafaudage requis sur le pan Nord.' }],
        },
      ]);
  });

  it('restores the selected export pages when the dialog is reopened', () => {
    cy.contains('.conf-row', 'Page de titre').click();
    cy.contains('.dialog-count', '7 sur 8').should('exist');

    cy.mount(<ExportPdfConfDialog onConfirm={cy.stub().as('onReopened')} />);

    cy.contains('.dialog-count', '7 sur 8').should('exist');
    cy.contains('.conf-row', 'Page de titre').should('have.attr', 'aria-checked', 'false');
  });

  it('publishes the pages and the conf to the annotator store so the draft can persist them', () => {
    cy.contains('.conf-row', 'Page de titre').click();

    cy.get('[data-testid="add-custom-page"]').click();
    cy.get(`[placeholder="${TITLE_PLACEHOLDER}"]`).type('Observations de chantier');
    addBlock('Texte');
    cy.get(`[placeholder="${TEXT_PLACEHOLDER}"]`).type('Echafaudage requis sur le pan Nord.');
    cy.get('[data-testid="custom-page-save"]').click();

    cy.wrap(null).should(() => {
      const { exportCustomPages, exportPdfConf } = useAnnotatorComponentStore.getState();
      expect(exportCustomPages).to.have.length(1);
      expect(exportCustomPages?.[0].pageTitle).to.equal('Observations de chantier');
      expect(exportPdfConf?.showTitlePage).to.equal(false);
    });
  });

  it('removes a page from the list', () => {
    cy.get('[data-testid="add-custom-page"]').click();
    cy.get(`[placeholder="${TITLE_PLACEHOLDER}"]`).type('Page a supprimer');
    addBlock('Texte');
    cy.get(`[placeholder="${TEXT_PLACEHOLDER}"]`).type('Contenu.');
    cy.get('[data-testid="custom-page-save"]').click();

    cy.get('[aria-label="Supprimer Page a supprimer"]').click();
    cy.contains('Page a supprimer').should('not.exist');

    cy.get('[data-testid="export-pdf-conf-confirm"]').click();
    cy.get('@onConfirm').its('firstCall.args.0.customPages').should('deep.equal', []);
  });
});
