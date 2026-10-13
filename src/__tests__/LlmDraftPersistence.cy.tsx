import { buildRequestBody, getLlmSignature, subscribeLlmDraftSave } from '@/common/fetcher/save-annotations';
import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { useRetrievePolygons } from '@/operations/invoice/utils/use-retrieve-polygons';
import { cache } from '@/providers';
import { AreaPictureAnnotation, AreaPictureDetails } from '@bpartners/typescript-client';
import { FC } from 'react';
import { account1 } from './mocks/responses/account-api';

const PICTURE_ID = 'mock-area-picture-id1';
const DRAFT_ID = 'llm-draft-1';
const AREA_PICTURE_DETAILS = { id: PICTURE_ID, address: '12 Rue Test' } as AreaPictureDetails;

const REPORT = '<body>rapport de toiture</body>';
const REPORT_KEY = '{"wearLevel":10,"moldRate":5}';

const DRAFT_WITH_REPORT = {
  id: DRAFT_ID,
  idAreaPicture: PICTURE_ID,
  annotations: [],
  properties: { llm: REPORT, llmKey: REPORT_KEY },
} as unknown as AreaPictureAnnotation;

const RestoreHarness: FC<{ draft: AreaPictureAnnotation }> = ({ draft }) => {
  useRetrievePolygons(draft);
  return null;
};

describe('Draft persistence of the llm report', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    window.history.replaceState({}, '', `?pictureId=${PICTURE_ID}&draftAnnotationId=${DRAFT_ID}`);
    useAnnotatorComponentStore.getState().reset();
    annotatorStore.useAnnotatorStore.getState().reset();
    cache.account(account1);
    cache.token('dummy-access-token', 'dummy-refresh-token');
  });

  it('carries the report and the key that produced it in the draft properties', () => {
    useAnnotatorComponentStore.getState().setLlm(REPORT, REPORT_KEY);

    const { properties } = buildRequestBody(PICTURE_ID, 4, useAnnotatorComponentStore.getState().llm);

    expect(properties.llm).to.equal(REPORT);
    expect(properties.llmKey).to.equal(REPORT_KEY);
  });

  it('leaves llmKey empty for a report that carries no key', () => {
    useAnnotatorComponentStore.getState().setLlm(REPORT);

    const { properties } = buildRequestBody(PICTURE_ID, 4, useAnnotatorComponentStore.getState().llm);

    expect(properties.llm).to.equal(REPORT);
    expect(properties.llmKey).to.equal(null);
  });

  it('only reports a new signature when the report or its key changes', () => {
    const initial = getLlmSignature();

    useAnnotatorComponentStore.getState().setRoofSlope(30);
    expect(getLlmSignature()).to.equal(initial);

    useAnnotatorComponentStore.getState().setLlm(REPORT, REPORT_KEY);
    const withReport = getLlmSignature();
    expect(withReport).not.to.equal(initial);

    useAnnotatorComponentStore.getState().setLlm(REPORT, 'another-key');
    expect(getLlmSignature()).not.to.equal(withReport);
  });

  it('saves the draft as soon as a generated report lands in the store', () => {
    const save = cy.spy().as('save');
    const unsubscribe = subscribeLlmDraftSave(AREA_PICTURE_DETAILS, 4, save);

    useAnnotatorComponentStore.getState().setLlm(REPORT, REPORT_KEY);

    cy.get('@save')
      .should('have.been.calledOnce')
      .then(() => {
        const [resource, params] = save.getCall(0).args;
        expect(resource).to.equal('drafts-annotations');
        expect(params.data.properties.llm).to.equal(REPORT);
        expect(params.data.properties.llmKey).to.equal(REPORT_KEY);
        unsubscribe();
      });
  });

  it('does not save again while the report is unchanged', () => {
    const save = cy.spy().as('unchangedSave');
    const unsubscribe = subscribeLlmDraftSave(AREA_PICTURE_DETAILS, 4, save);

    useAnnotatorComponentStore.getState().setLlm(REPORT, REPORT_KEY);
    useAnnotatorComponentStore.getState().setRoofSlope(30);
    useAnnotatorComponentStore.getState().setGlobalRate(12, 'C');

    cy.get('@unchangedSave')
      .should('have.been.calledOnce')
      .then(() => unsubscribe());
  });

  it('saves nothing while no report has been generated', () => {
    const save = cy.spy().as('emptySave');
    const unsubscribe = subscribeLlmDraftSave(AREA_PICTURE_DETAILS, 4, save);

    useAnnotatorComponentStore.getState().setRoofSlope(30);

    cy.get('@emptySave')
      .should('not.have.been.called')
      .then(() => unsubscribe());
  });

  it('subscribes to nothing while the area picture is unknown', () => {
    const save = cy.spy().as('detachedSave');
    const unsubscribe = subscribeLlmDraftSave(null, 4, save);

    useAnnotatorComponentStore.getState().setLlm(REPORT, REPORT_KEY);

    cy.get('@detachedSave')
      .should('not.have.been.called')
      .then(() => unsubscribe());
  });

  it('restores the report and its key from the draft properties', () => {
    cy.mount(<RestoreHarness draft={DRAFT_WITH_REPORT} />);

    cy.then(() => {
      const { llm, llmKey } = useAnnotatorComponentStore.getState();
      expect(llm).to.equal(REPORT);
      expect(llmKey).to.equal(REPORT_KEY);
    });
  });
});
