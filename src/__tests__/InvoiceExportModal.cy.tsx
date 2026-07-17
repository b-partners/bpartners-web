import { InvoiceExportModal } from '@/operations/invoice/components';
import dayjs from 'dayjs';

const SUBMIT = '[name="export-invoice-submit"]';
const STATUSES = '[name="export-invoice-statuses"]';
const BATCH_SIZE = '[name="export-invoice-batch-size"]';
const FROM = '[name="export-invoice-from"]';
const TO = '[name="export-invoice-to"]';

const period = (value: string) => `[name="export-invoice-period"][value="${value}"]`;
const archiveStatus = (value: string) => `[name="export-invoice-archive-status"][value="${value}"]`;

const mountModal = (props = {}) => {
  const onSubmit = cy.stub().as('onSubmit');
  const onClose = cy.stub().as('onClose');
  cy.mount(<InvoiceExportModal open={true} onClose={onClose} onSubmit={onSubmit} {...props} />);
};

const submittedFilters = (index = 0) => cy.get('@onSubmit').then((stub: any) => stub.getCall(index).args[0]);

describe('InvoiceExportModal', () => {
  it('submits the default filters', () => {
    mountModal();

    cy.get(period('CURRENT_MONTH')).should('be.checked');
    cy.get(archiveStatus('ENABLED')).should('be.checked');
    cy.get(BATCH_SIZE).should('have.value', '100');
    cy.contains('.MuiChip-label', 'Facture émise').should('be.visible');

    cy.get(SUBMIT).click();

    submittedFilters().should(filters => {
      expect(filters.period).to.eq('CURRENT_MONTH');
      expect(filters.statuses).to.deep.eq(['CONFIRMED']);
      expect(filters.archiveStatus).to.eq('ENABLED');
      expect(filters.batchSize).to.eq(100);
      expect(filters.from.format('YYYY-MM-DD')).to.eq(dayjs().startOf('month').format('YYYY-MM-DD'));
      expect(filters.to.format('YYYY-MM-DD')).to.eq(dayjs().format('YYYY-MM-DD'));
    });
  });

  it('hides the date pickers unless the custom period is selected', () => {
    mountModal();

    cy.get(FROM).should('not.exist');
    cy.get(TO).should('not.exist');

    cy.get(period('CUSTOM')).check({ force: true });

    cy.get(FROM).should('be.visible');
    cy.get(TO).should('be.visible');

    cy.get(period('TODAY')).check({ force: true });

    cy.get(FROM).should('not.exist');
  });

  const today = dayjs().startOf('day');
  const ranges = [
    { id: 'TODAY', from: today, to: today },
    { id: 'CURRENT_MONTH', from: today.startOf('month'), to: today },
    { id: 'LAST_7_DAYS', from: today.subtract(6, 'day'), to: today },
    { id: 'LAST_4_WEEKS', from: today.subtract(27, 'day'), to: today },
    { id: 'LAST_MONTH', from: today.subtract(1, 'month').startOf('month'), to: today.subtract(1, 'month').endOf('month').startOf('day') },
  ];

  ranges.forEach(({ id, from, to }) => {
    it(`computes the range of the ${id} period`, () => {
      mountModal();

      cy.get(period(id)).check({ force: true });
      cy.get(SUBMIT).click();

      submittedFilters().should(filters => {
        expect(filters.period).to.eq(id);
        expect(filters.from.format('YYYY-MM-DD')).to.eq(from.format('YYYY-MM-DD'));
        expect(filters.to.format('YYYY-MM-DD')).to.eq(to.format('YYYY-MM-DD'));
      });
    });
  });

  it('submits the dates typed in the custom period', () => {
    mountModal();

    cy.get(period('CUSTOM')).check({ force: true });
    cy.get(FROM).clear().type('01/02/2026');
    cy.get(TO).clear().type('28/02/2026');
    cy.get(SUBMIT).click();

    submittedFilters().should(filters => {
      expect(filters.period).to.eq('CUSTOM');
      expect(filters.from.format('YYYY-MM-DD')).to.eq('2026-02-01');
      expect(filters.to.format('YYYY-MM-DD')).to.eq('2026-02-28');
    });
  });

  it('adds a status as a chip and removes it from the options', () => {
    mountModal();

    cy.get(STATUSES).click();
    cy.contains('.MuiAutocomplete-option', 'Facture émise').should('not.exist');
    cy.contains('.MuiAutocomplete-option', 'Payé').click();
    cy.contains('.MuiChip-label', 'Payé').should('be.visible');
    cy.contains('.MuiAutocomplete-option', 'Payé').should('not.exist');

    cy.get('body').type('{esc}');
    cy.get(SUBMIT).click();

    submittedFilters().should(filters => expect(filters.statuses).to.deep.eq(['CONFIRMED', 'PAID']));
  });

  it('removes a status when its chip is deleted', () => {
    mountModal();

    cy.contains('.MuiChip-root', 'Facture émise').find('.MuiChip-deleteIcon').click();

    cy.contains('.MuiChip-label', 'Facture émise').should('not.exist');
    cy.get(SUBMIT).should('be.disabled');

    cy.get(STATUSES).should('have.attr', 'placeholder', 'Sélectionner un statut').click();
    cy.contains('.MuiAutocomplete-option', 'Facture émise').should('be.visible');
  });

  it('submits the archived state', () => {
    mountModal();

    cy.get(archiveStatus('DISABLED')).check({ force: true });
    cy.get(SUBMIT).click();

    submittedFilters().should(filters => expect(filters.archiveStatus).to.eq('DISABLED'));
  });

  it('submits a custom batch size', () => {
    mountModal();

    cy.get(BATCH_SIZE).clear().type('25');
    cy.get(SUBMIT).click();

    submittedFilters().should(filters => expect(filters.batchSize).to.eq(25));
  });

  it('disables the submit button on an invalid batch size', () => {
    mountModal();

    cy.get(BATCH_SIZE).clear().type('0');
    cy.get(SUBMIT).should('be.disabled');

    cy.get(BATCH_SIZE).clear();
    cy.get(SUBMIT).should('be.disabled');

    cy.get(BATCH_SIZE).type('1');
    cy.get(SUBMIT).should('be.enabled');
  });

  it('shows an indeterminate progress bar while loading', () => {
    mountModal({ isLoading: true });

    cy.get('.export-progress').should('have.class', 'MuiLinearProgress-indeterminate');
    cy.get(SUBMIT).should('be.disabled');
  });

  it('shows a determinate progress bar when the progress is known', () => {
    mountModal({ isLoading: true, progress: 50 });

    cy.get('.export-progress').should('have.class', 'MuiLinearProgress-determinate');
    cy.get('.export-progress .MuiLinearProgress-bar').should('have.attr', 'style').and('include', 'translateX(-50%)');
  });

  it('closes without submitting', () => {
    mountModal();

    cy.get('[name="export-invoice-cancel"]').click();

    cy.get('@onClose').should('have.been.calledOnce');
    cy.get('@onSubmit').should('not.have.been.called');
  });
});
