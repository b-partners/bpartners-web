import { useAnnotatorComponentStore } from '@/common/store';
import { ExportPdfConfDialog } from '@/operations/annotator/components/export-pdf-conf-dialog';
import { cache } from '@/providers';
import { account1 } from './mocks/responses/account-api';

const TITLE_PLACEHOLDER = 'Titre de la page';
const TEXT_PLACEHOLDER = 'Saisissez votre texte…';
const CAPTION_PLACEHOLDER = 'Légende (facultatif)';
const URL_PLACEHOLDER = "Collez l'URL de l'image puis appuyez sur Entrée";

const PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const addBlock = (label: string) => {
  cy.get('[data-testid="add-custom-page-block"]').click();
  cy.contains('li', label).click();
};

const openPage = (title: string) => {
  cy.get('[data-testid="add-custom-page"]').click();
  cy.get(`[placeholder="${TITLE_PLACEHOLDER}"]`).type(title);
};

const confirmExport = () => cy.get('[data-testid="export-pdf-conf-confirm"]').click();

describe('Blocks of a supplementary page', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    useAnnotatorComponentStore.getState().reset();
    cy.mount(<ExportPdfConfDialog onConfirm={cy.stub().as('onConfirm')} />);
  });

  it('builds a table block and hands its rows to the export payload', () => {
    openPage('Relevé de mesures');
    addBlock('Tableau');

    cy.get('[placeholder="Colonne 1"]').type('Pan');
    cy.get('[placeholder="Colonne 2"]').type('Surface');
    cy.get('.render-table tbody tr').first().find('td').first().find('textarea').first().type('Nord');

    cy.contains('.table-control', 'Ajouter une colonne').click();
    cy.get('.render-table thead th').should('have.length', 3);

    cy.contains('.table-control', 'Ajouter une ligne').click();
    cy.get('.render-table tbody tr').should('have.length', 2);

    cy.contains('.table-control', 'Retirer une ligne').click();
    cy.get('.render-table tbody tr').should('have.length', 1);

    cy.contains('.table-control', 'Retirer une colonne').click();
    cy.get('.render-table thead th').should('have.length', 2);

    cy.get('[data-testid="custom-page-save"]').click();
    confirmExport();

    cy.get('@onConfirm')
      .its('firstCall.args.0.customPages')
      .should('deep.equal', [
        {
          pageTitle: 'Relevé de mesures',
          sections: [{ type: 'TABLE', priority: 'MEDIUM', tableData: { headers: ['Pan', 'Surface'], rows: [['Nord', '']] } }],
        },
      ]);
  });

  it('fills both panes of a two column block', () => {
    openPage('Comparatif');
    addBlock('Deux colonnes');

    cy.get('.block-columns .column').should('have.length', 2);
    cy.get(`[placeholder="${TEXT_PLACEHOLDER}"]`).eq(0).type('Avant travaux');
    cy.get(`[placeholder="${TEXT_PLACEHOLDER}"]`).eq(1).type('Apres travaux');

    cy.get('[data-testid="custom-page-save"]').click();
    confirmExport();

    cy.get('@onConfirm')
      .its('firstCall.args.0.customPages.0.sections.0')
      .should('deep.equal', {
        type: 'SPLIT_SECTION',
        priority: 'MEDIUM',
        leftSection: { type: 'TEXT', priority: 'MEDIUM', text: 'Avant travaux' },
        rightSection: { type: 'TEXT', priority: 'MEDIUM', text: 'Apres travaux' },
      });
  });

  it('fills the three panes of a three column block', () => {
    openPage('Trois vues');
    addBlock('Trois colonnes');

    cy.get('.block-columns .column').should('have.length', 3);
    cy.get(`[placeholder="${TEXT_PLACEHOLDER}"]`).eq(0).type('Gauche');
    cy.get(`[placeholder="${TEXT_PLACEHOLDER}"]`).eq(1).type('Milieu');
    cy.get(`[placeholder="${TEXT_PLACEHOLDER}"]`).eq(2).type('Droite');

    cy.get('[data-testid="custom-page-save"]').click();
    confirmExport();

    cy.get('@onConfirm')
      .its('firstCall.args.0.customPages.0.sections.0')
      .should('deep.equal', {
        type: 'THREE_SPLIT_SECTION',
        priority: 'MEDIUM',
        leftSection: { type: 'TEXT', priority: 'MEDIUM', text: 'Gauche' },
        middleSection: { type: 'TEXT', priority: 'MEDIUM', text: 'Milieu' },
        rightSection: { type: 'TEXT', priority: 'MEDIUM', text: 'Droite' },
      });
  });

  it('switches a column pane to another block type', () => {
    openPage('Colonne mixte');
    addBlock('Deux colonnes');

    cy.get('[aria-label="Type du bloc Droite"]').click();
    cy.contains('li', 'Tableau').click();

    cy.get('.block-columns .column').eq(1).find('.render-table').should('exist');
  });

  it('changes the priority of a block and drops it from the page', () => {
    openPage('Observations');
    addBlock('Texte');
    cy.get(`[placeholder="${TEXT_PLACEHOLDER}"]`).type('Echafaudage requis.');

    cy.get('[aria-label="Options du bloc Texte"]').click();
    cy.contains('li', 'Important').click();
    cy.get('.block-text').should('have.class', 'prio-important');

    cy.get('[data-testid="custom-page-save"]').click();
    cy.contains('.page-row', 'Observations').should('exist');

    cy.get('[aria-label="Modifier Observations"]').click();
    cy.get('[aria-label="Options du bloc Texte"]').click();
    cy.contains('li', 'Supprimer le bloc').click();

    cy.get('.block-text').should('not.exist');
    cy.get('[data-testid="custom-page-save"]').should('be.disabled');
  });

  it('reorders blocks with the move up and down buttons', () => {
    openPage('Ordre des blocs');
    addBlock('Texte');
    cy.get(`[placeholder="${TEXT_PLACEHOLDER}"]`).eq(0).type('Premier');
    addBlock('Texte');
    cy.get(`[placeholder="${TEXT_PLACEHOLDER}"]`).eq(1).type('Second');
    addBlock('Texte');
    cy.get(`[placeholder="${TEXT_PLACEHOLDER}"]`).eq(2).type('Troisieme');

    cy.get('[aria-label="Monter le bloc"]').first().should('be.disabled');
    cy.get('[aria-label="Descendre le bloc"]').last().should('be.disabled');

    cy.get('.block').eq(2).find('[aria-label="Monter le bloc"]').click();
    cy.get(`[placeholder="${TEXT_PLACEHOLDER}"]`).eq(1).should('have.value', 'Troisieme');
    cy.get(`[placeholder="${TEXT_PLACEHOLDER}"]`).eq(2).should('have.value', 'Second');

    cy.get('.block').eq(0).find('[aria-label="Descendre le bloc"]').click();

    cy.get('[data-testid="custom-page-save"]').click();
    confirmExport();

    cy.get('@onConfirm')
      .its('firstCall.args.0.customPages.0.sections')
      .should('deep.equal', [
        { type: 'TEXT', priority: 'MEDIUM', text: 'Troisieme' },
        { type: 'TEXT', priority: 'MEDIUM', text: 'Premier' },
        { type: 'TEXT', priority: 'MEDIUM', text: 'Second' },
      ]);
  });

  it('keeps the caption typed under an image', () => {
    const url = 'https://storage.test/photo.jpg';

    openPage('Reportage photo');
    addBlock('Image');

    cy.get('[aria-label="Ajouter une image par URL"]').scrollIntoView().should('be.visible').click();
    cy.get(`[placeholder="${URL_PLACEHOLDER}"]`).type(`${url}{enter}`);
    cy.get(`[placeholder="${CAPTION_PLACEHOLDER}"]`).type('Pan Nord');

    cy.get('[data-testid="custom-page-save"]').click();
    confirmExport();

    cy.get('@onConfirm').its('firstCall.args.0.customPages.0.sections.0').should('deep.equal', { type: 'IMAGE', priority: 'MEDIUM', url, caption: 'Pan Nord' });
  });

  it('uploads a picked image when the page is saved and exports it by its file id', () => {
    cy.intercept('POST', '/accounts/*/files/*/raw*', { statusCode: 200, body: {} }).as('uploadPageImage');

    cy.then(() => {
      cache.account(account1);
      cache.token('dummy-access-token', 'dummy-refresh-token');
    });

    openPage('Photo de chantier');
    addBlock('Image');

    cy.get('input[type=file]').selectFile(
      { contents: Cypress.Buffer.from(PNG_BASE64, 'base64'), fileName: 'toiture.png', mimeType: 'image/png' },
      { force: true }
    );

    cy.get('.image-preview')
      .should('have.attr', 'src')
      .and('match', /^blob:/);

    cy.get('[data-testid="custom-page-save"]').click();
    cy.wait('@uploadPageImage').its('request.url').should('include', `/accounts/${account1.id}/files/custom-page-`);

    confirmExport();

    cy.get('@onConfirm')
      .its('firstCall.args.0.customPages.0.sections.0')
      .should(section => {
        expect(section.type).to.equal('IMAGE');
        expect(section.fileId).to.equal(undefined);
        expect(section.url).to.include(`/accounts/${account1.id}/files/custom-page-`);
        expect(section.url).to.include('accessToken=dummy-access-token');
      });
  });
});
