import { getCached } from './cache';
import { draftAreaPictureAnnotatorProvider } from './draft-area-annotations-provider';

describe('draftAreaPictureAnnotatorProvider.getList', () => {
  beforeEach(() => {
    cy.stub(getCached, 'userInfo').returns({ accountId: 'account1' });
  });

  it('sends creationFrom/creationTo as full ISO date-time instants, not bare datetime-local values', () => {
    cy.intercept('GET', '**/annotations/drafts**', req => {
      expect(req.query.creationFrom).to.eq('2026-08-18T09:00:00.000Z');
      expect(req.query.creationTo).to.eq('2026-08-20T17:30:00.000Z');
      req.reply([]);
    }).as('getDraftAnnotations');

    draftAreaPictureAnnotatorProvider.getList(1, 10, { creationFrom: '2026-08-18T09:00', creationTo: '2026-08-20T17:30' });

    cy.wait('@getDraftAnnotations');
  });

  it('leaves prospectName/address untouched', () => {
    cy.intercept('GET', '**/annotations/drafts**', req => {
      expect(req.query.prospectName).to.eq('Jane Doe');
      expect(req.query.address).to.eq('Paris');
      expect(req.query.creationFrom).to.be.undefined;
      req.reply([]);
    }).as('getDraftAnnotations');

    draftAreaPictureAnnotatorProvider.getList(1, 10, { prospectName: 'Jane Doe', address: 'Paris' });

    cy.wait('@getDraftAnnotations');
  });
});
