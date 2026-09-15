import { buildRequestBody, getExportSelection } from '@/common/fetcher/save-annotations';
import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { useRestoreExportSelection } from '@/operations/annotator/utils';
import { cache } from '@/providers';
import { FC } from 'react';
import { account1 } from './mocks/responses/account-api';

const PICTURE_ID = 'mock-area-picture-id1';

const CONF = { showTitlePage: false, showAnnotationPages: true };
const PAGES = [{ id: 'page-1', pageTitle: 'Observations de chantier', sections: [{ type: 'TEXT', priority: 'MEDIUM', text: 'Echafaudage.' }] }];

const RestoreHarness: FC<{ properties?: Record<string, unknown> }> = ({ properties }) => {
  useRestoreExportSelection(properties);
  return null;
};

describe('Draft persistence of the pdf export selection', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    useAnnotatorComponentStore.getState().reset();
    annotatorStore.useAnnotatorStore.getState().reset();
    cache.account(account1);
    cache.token('dummy-access-token', 'dummy-refresh-token');
  });

  it('carries the selection in the draft properties', () => {
    useAnnotatorComponentStore.getState().setExportPdfConf(CONF);
    useAnnotatorComponentStore.getState().setExportCustomPages(PAGES as any);

    const { properties } = buildRequestBody(PICTURE_ID, 4, null);

    expect(properties.exportPdfConf).to.deep.equal(CONF);
    expect(properties.exportCustomPages).to.have.length(1);
    expect((properties.exportCustomPages as typeof PAGES)[0].pageTitle).to.equal('Observations de chantier');
  });

  it('leaves the selection keys out of the properties while nothing is selected', () => {
    const { properties } = buildRequestBody(PICTURE_ID, 4, null);

    expect(properties).not.to.have.property('exportPdfConf');
    expect(properties).not.to.have.property('exportCustomPages');
  });

  it('only reports a new selection when an export key changes', () => {
    const initial = getExportSelection();

    useAnnotatorComponentStore.getState().setRoofSlope(30);
    expect(getExportSelection()).to.equal(initial);

    useAnnotatorComponentStore.getState().setExportPdfConf(CONF);
    expect(getExportSelection()).not.to.equal(initial);
  });

  it('restores the selection carried by the draft properties', () => {
    cy.mount(<RestoreHarness properties={{ exportPdfConf: CONF, exportCustomPages: PAGES }} />);

    cy.then(() => {
      const { exportPdfConf, exportCustomPages } = useAnnotatorComponentStore.getState();
      expect(exportPdfConf).to.deep.equal(CONF);
      expect(exportCustomPages).to.have.length(1);
      expect(exportCustomPages?.[0].pageTitle).to.equal('Observations de chantier');
    });
  });

  it('keeps the store untouched when the draft carries no selection', () => {
    cy.mount(<RestoreHarness properties={{ llm: 'something else' }} />);

    cy.then(() => {
      const { exportPdfConf, exportCustomPages } = useAnnotatorComponentStore.getState();
      expect(exportPdfConf).to.equal(null);
      expect(exportCustomPages).to.equal(null);
    });
  });
});
