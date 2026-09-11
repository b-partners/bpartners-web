import { useStepProgress } from '@/common/hooks';
import { wait } from '@/common/utils';
import { geoRecordIds } from '@bpartners/roof-analyser';
import { AreaPictureAnnotation, Prospect, ZoomLevel } from '@bpartners/typescript-client';
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useCreate, useNotify, useUpdate } from 'react-admin';
import { useNavigate } from 'react-router';
import { v4 as uuidV4 } from 'uuid';
import { useDialog } from '../store/dialog';

const PROSPECT_STEPS = 3;
const PROSPECT_PROGRESS_DURATION_MS = 10000;

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

/**
 * Creates the prospect, then opens its analyse before the annotator mounts: an area picture linked to the
 * prospect, then a draft annotation with default values, both under the ids the library derives from the
 * session id. The library is handed that id, adopts the record as it stands and saves the session into it.
 */
export const useMutateProspect = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const [create, { isPending: isCreatePending }] = useCreate();
  const [saveDraftAnnotation, { isPending: isDraftAnnotationPending }] = useUpdate('drafts-annotations');
  const { progress, start, advance, complete, reset: resetProgress } = useStepProgress(PROSPECT_STEPS, undefined, PROSPECT_PROGRESS_DURATION_MS);

  const handleError = (error: any) => {
    resetProgress();
    onError(error);
  };

  const onProspectSuccess = (prospect: Prospect, prospectId: string) => {
    advance();
    notify(`resources.prospects.creation.success`, { type: 'success' });
    const sessionId = uuidV4();
    const { areaPictureId, annotationId, fileId } = geoRecordIds(sessionId);

    const onDraftAnnotationSuccess = () => {
      complete();
      wait(800).then(() => {
        navigate(`/projects/${sessionId}?flow=geo&address=${encodeURIComponent(prospect.address || '')}`);
        useDialog.getState().close();
      });
    };

    const onAreaPictureSuccess = () => {
      advance();
      const draftAnnotation: AreaPictureAnnotation = {
        id: annotationId,
        idAreaPicture: areaPictureId,
        creationDatetime: new Date(),
        annotations: [],
        properties: { geoSessionId: sessionId },
        isDraft: true,
      };
      saveDraftAnnotation(
        'drafts-annotations',
        { id: annotationId, data: draftAnnotation, meta: { pictureId: areaPictureId, annotationId } },
        { onError: handleError, onSuccess: onDraftAnnotationSuccess }
      );
    };

    const areaPicture = {
      id: areaPictureId,
      address: prospect.address,
      fileId,
      filename: `Layer ${prospect.address}`,
      prospectId,
      zoomLevel: ZoomLevel.BUILDING,
      isExtended: true,
      downloadImage: false,
    };
    create('area-picture-details', { data: areaPicture }, { onError: handleError, onSuccess: onAreaPictureSuccess });
  };

  const mutate = (prospect: Prospect) => {
    const prospectId = prospect.id ?? uuidV4();
    start();
    create(
      'prospects',
      { data: { ...prospect, id: prospectId } },
      { onError: handleError, onSuccess: created => onProspectSuccess(created, created?.id ?? prospectId) }
    );
  };

  return { mutate, isPending: isCreatePending || isDraftAnnotationPending, progress };
};
