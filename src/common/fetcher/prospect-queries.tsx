import { useStepProgress } from '@/common/hooks';
import { wait } from '@/common/utils';
import { Prospect } from '@bpartners/typescript-client';
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useCreate, useNotify } from 'react-admin';
import { useNavigate } from 'react-router';
import { v4 as uuidV4 } from 'uuid';
import { useDialog } from '../store/dialog';

const PROSPECT_STEPS = 2;
const PROSPECT_PROGRESS_DURATION_MS = 6000;

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
  const [create, { isPending }] = useCreate();
  const { progress, start, advance, complete, reset: resetProgress } = useStepProgress(PROSPECT_STEPS, undefined, PROSPECT_PROGRESS_DURATION_MS);

  const handleError = (error: any) => {
    resetProgress();
    onError(error);
  };

  // The annotator owns its own record: the session id names it, and the library creates the area picture
  // and the draft annotation behind it. Only the prospect is created here.
  const onProspectSuccess = (prospect: Prospect) => {
    advance();
    notify(`resources.prospects.creation.success`, { type: 'success' });
    const sessionId = uuidV4();
    complete();
    wait(800).then(() => {
      navigate(`/projects/${sessionId}?flow=geo&address=${encodeURIComponent(prospect.address || '')}`);
      useDialog.getState().close();
    });
  };

  const mutate = (prospect: Prospect) => {
    start();
    create('prospects', { data: prospect }, { onError: handleError, onSuccess: onProspectSuccess });
  };

  return { mutate, isPending, progress };
};
