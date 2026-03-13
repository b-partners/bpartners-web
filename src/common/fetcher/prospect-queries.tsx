import { annotatorProvider, clearPolygons, clearRoofDelimiter, prospectingProvider } from '@/providers';
import { FileType, Prospect, ZoomLevel } from '@bpartners/typescript-client';
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useNotify } from 'react-admin';
import { useNavigate } from 'react-router';
import { v4 as uuidV4 } from 'uuid';
import { annotatorStore, useAnnotatorComponentFormItemStore, useAnnotatorComponentStore } from '../store';
import { useDialog } from '../store/dialog';
import { getFileUrl } from '../utils';

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

  const fetch = async (prospect: Prospect) => {
    // reset annotator page state
    clearPolygons();
    clearRoofDelimiter();
    useAnnotatorComponentStore.getState().reset();
    setAnnotatorSidebarAccordionItem(0);
    resetAnnotations();
    clearPolygons();
    // reset annotator page state

    await prospectingProvider.saveOrUpdate([prospect]);
    notify(`resources.prospects.creation.success`, { type: 'success' });

    try {
      const fileId = uuidV4();
      const pictureId = uuidV4();
      const fileUrl = getFileUrl(fileId, FileType.AREA_PICTURE);

      await annotatorProvider.getPictureFormAddress(pictureId, {
        address: prospect.address,
        fileId,
        filename: `Layer ${prospect.address}`,
        prospectId: prospect.id,
        zoomLevel: ZoomLevel.BUILDING,
        isExtended: true,
      });

      navigate(
        `/annotator?imgUrl=${encodeURIComponent(fileUrl)}&address=${prospect.address}&zoomLevel=${ZoomLevel.BUILDING}&pictureId=${pictureId}&useDrafts=false&prospectId=${prospect.id}&fileId=${fileId}`
      );
      return;
    } catch (err: any) {
      console.log(err);
    }
  };

  return useMutation({ mutationFn: fetch, onError, onSuccess: useDialog.getState().close });
};
