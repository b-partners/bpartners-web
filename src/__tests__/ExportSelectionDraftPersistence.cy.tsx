import { useSaveAnnotations } from '@/common/fetcher';
import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { useRestoreExportSelection } from '@/operations/annotator/utils';
import { cache, dataProvider } from '@/providers';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { FC } from 'react';
import { AdminContext } from 'react-admin';
import { account1 } from './mocks/responses/account-api';

const PICTURE_ID = 'mock-area-picture-id1';

const CONF = { showTitlePage: false, showAnnotationPages: true };
const PAGES = [{ id: 'page-1', pageTitle: 'Observations de chantier', sections: [{ type: 'TEXT', priority: 'MEDIUM', text: 'Echafaudage.' }] }];

const SaveHarness = () => {
  useSaveAnnotations();
  return null;
};

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

  it('writes the selection into the draft properties when it changes', () => {
    cy.intercept('PUT', '**/annotations/**', { statusCode: 200, body: {} }).as('saveDraft');

    cy.then(() => useAnnotatorComponentStore.getState().setAreaPictureDetails({ id: PICTURE_ID, fileId: 'mock-file-id1' } as AreaPictureDetails));

    cy.clock();
    cy.mount(
      <AdminContext dataProvider={dataProvider}>
        <SaveHarness />
      </AdminContext>
    );

    cy.then(() => {
      useAnnotatorComponentStore.getState().setExportPdfConf(CONF);
      useAnnotatorComponentStore.getState().setExportCustomPages(PAGES as any);
    });

    cy.tick(10000);

    cy.wait('@saveDraft')
      .its('request.body.properties')
      .should(properties => {
        expect(properties.exportPdfConf).to.deep.equal(CONF);
        expect(properties.exportCustomPages).to.have.length(1);
        expect(properties.exportCustomPages[0].pageTitle).to.equal('Observations de chantier');
      });
  });

  it('leaves the selection out of the properties while nothing has been selected', () => {
    cy.intercept('PUT', '**/annotations/**', { statusCode: 200, body: {} }).as('saveDraft');

    cy.then(() => useAnnotatorComponentStore.getState().setAreaPictureDetails({ id: PICTURE_ID, fileId: 'mock-file-id1' } as AreaPictureDetails));

    cy.clock();
    cy.mount(
      <AdminContext dataProvider={dataProvider}>
        <SaveHarness />
      </AdminContext>
    );

    cy.then(() => useAnnotatorComponentStore.getState().setRoofSlope(30));
    cy.tick(10000);

    cy.get('@saveDraft.all').should('have.length', 0);
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
