import { clearPolygons, clearRoofDelimiter } from '@/providers';
import { AreaPictureAnnotation, Prospect, ZoomLevel } from '@bpartners/typescript-client';
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useCreate, useNotify, useUpdate } from 'react-admin';
import { useNavigate } from 'react-router';
import { v4 as uuidV4, v4 } from 'uuid';
import {
  annotatorStore,
  roof3DStore,
  useAnnotator3DStore,
  useAnnotatorComponentFormItemStore,
  useAnnotatorComponentStore,
  useAnnotatorScreenSwitch,
} from '../store';
import { useDialog } from '../store/dialog';

const onError = (error: any) => {
  let errorMessage = "Une erreur s'est produite, veuillez réessayer.";

  const notSupportedPattern = /Address or zone [\s\S]* not yet supported/i;
  const temporarilyUnavailablePattern = /Address or zone [\s\S]* temporarily unavailable/i;

  if (error.message === 'precisionLevelInCm' || temporarilyUnavailablePattern.test(error.message)) errorMessage = 'Adresse momentanément indisponible.';
  if (notSupportedPattern.test(error.message)) errorMessage = "La zone contenant cette adresse n'est pas encore supporté.";
  if (error.message.includes('Roof analysis consumption ') && error.message.includes(' limit exceeded for free trial period for User.id='))
    errorMessage = 'La limite des analyses gratuites a été atteinte.';

  useDialog.getState().open(
    <>
      <DialogTitle>Erreur</DialogTitle>
      <DialogContent>
        <DialogContentText>{errorMessage}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={useDialog.getState().close}>Fermer</Button>
      </DialogActions>
    </>
  );
};

export const useMutateProspect = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { setAnnotatorSidebarAccordionItem: setAnnotatorSidebarAccordionItem } = useAnnotatorComponentFormItemStore();
  const resetAnnotations = annotatorStore.useAnnotatorStore(params => params.resetAnnotations);
  const { setScreen } = useAnnotatorScreenSwitch();
  const [create, { isPending: isAreaPictureDetailsPending }] = useCreate();
  const [saveDraftAnnotations, { isPending: isDraftAnnotationsPending }] = useUpdate('drafts-annotations');
  const { reset: reset3DStore } = useAnnotator3DStore();

  const onProspectSuccess = (prospect: Prospect) => {
    notify(`resources.prospects.creation.success`, { type: 'success' });
    const fileId = uuidV4();
    const pictureId = uuidV4();
    const draftAnnotationId = uuidV4();

    const areaPictureDetailsToCreate = {
      id: pictureId,
      address: prospect.address,
      fileId,
      filename: `Layer ${prospect.address}`,
      prospectId: prospect.id,
      zoomLevel: ZoomLevel.BUILDING,
      isExtended: true,
    };

    const onDraftAnnotationSuccess = () => {
      navigate(
        `/projects/${pictureId}?` +
          `&useDrafts=false` +
          `&fileId=${fileId}` +
          `&pictureId=${pictureId}` +
          `&prospectId=${prospect.id}` +
          `&address=${prospect.address}` +
          `&zoomLevel=${ZoomLevel.BUILDING}` +
          `&draftAnnotationId=${draftAnnotationId}`
      );
      useDialog.getState().close();
    };

    const onAreaPictureDetailsSuccess = () => {
      const requestBody: AreaPictureAnnotation = {
        id: draftAnnotationId,
        annotations: [],
        idAreaPicture: pictureId,
        properties: {
          roofAnalyseId: v4(),
          threeDGenerationId: v4(),
        },
        isDraft: true,
      };

      saveDraftAnnotations(
        'drafts-annotations',
        { data: requestBody, meta: { pictureId, annotationId: draftAnnotationId }, id: draftAnnotationId },
        { onSuccess: onDraftAnnotationSuccess }
      );
    };

    create('area-picture-details', { data: areaPictureDetailsToCreate }, { onError, onSuccess: onAreaPictureDetailsSuccess });
  };

  const mutate = (prospect: Prospect) => {
    // reset annotator page state
    clearPolygons();
    clearRoofDelimiter();
    reset3DStore();
    useAnnotatorComponentStore.getState().reset();
    setAnnotatorSidebarAccordionItem(0);
    resetAnnotations();
    annotatorStore.useAnnotatorStore.getState().reset();
    roof3DStore.useRoof3DStore.getState().reset();
    clearPolygons();
    setScreen('annotator');
    // reset annotator page state

    create('prospects', { data: prospect }, { onError, onSuccess: onProspectSuccess });
  };

  return { mutate, isPending: isAreaPictureDetailsPending || isDraftAnnotationsPending };
};
