import { useEffect, useState } from 'react';
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, Stack, Typography, Step, Stepper, StepLabel, StepContent, Button } from '@mui/material';
import { userAccountsApi } from '../../providers/api';
import { useNotify } from 'react-admin';
import { Document as Pdf, Page as PdfPage } from 'react-pdf/dist/esm/entry.webpack';
import AuthProvider from '../../providers/auth-provider';
import { DialogActions } from '@material-ui/core';

export const GeneralConditionOfUse = () => {
  const [legalFiles, setLegalFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [stepperState, setStepperState] = useState({
    activeStep: 0,
    loading: false,
  });

  const userId = AuthProvider.getCachedWhoami()?.user?.id;
  const notify = useNotify();

  const handleNext = () => setStepperState({ ...stepperState, activeStep: stepperState.activeStep + 1 });
  const handleBack = () => setStepperState({ ...stepperState, activeStep: stepperState.activeStep - 1 });

  useEffect(() => {
    const getLegalFile = async () => {
      if (userId) {
        try {
          setLoading(true);
          setStepperState({ ...stepperState, loading });
          const legalFilesToFetch = (await userAccountsApi().getLegalFiles(userId)).data;
          setLegalFiles(legalFilesToFetch);
        } catch (err) {
          notify("Une erreur s'est produite", { type: 'error' });
        } finally {
          setLoading(false);
        }
      }
    };

    getLegalFile();
  }, [notify, userId]);

  return userId ? (
    <Dialog
      open={true}
      scroll='paper'
      fullWidth
      maxWidth='md'
      sx={{
        backdropFilter: 'blur(0.1rem)',
      }}
    >
      <DialogTitle>
        <Stack direction='row' justifyContent='space-between'>
          <Typography variant='subtitle1'>Conditions générales d'utilisation</Typography>
          {loading && <CircularProgress size={'1.8rem'} />}
        </Stack>
      </DialogTitle>

      {(legalFiles || []).length > 0 && (
        <>
          <DialogContent dividers={true}>
            <StepLegalFiles stepperState={stepperState} setStepperState={setStepperState} legalFiles={legalFiles} />
          </DialogContent>

          <DialogActions>
            <Button type='button' disabled={stepperState.loading} onClick={stepperState.activeStep === legalFiles.length - 1 ? handleBack : handleNext}>
              {stepperState.activeStep === legalFiles.length - 1 ? 'Ok, Confirmer' : 'Continuer'}
            </Button>

            <Button type='button' onClick={handleBack}>
              Revenir
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  ) : null;
};

const StepLegalFiles = ({ legalFiles, stepperState, setStepperState }) => {
  const { activeStep } = stepperState;

  const onLoadEnd = () => setStepperState(() => ({ ...stepperState, loading: false }));

  return (
    <Stepper activeStep={activeStep} orientation='vertical'>
      {legalFiles.map(({ fileUrl, name }) => (
        <Step key={name}>
          <StepLabel>{name}</StepLabel>
          <StepContent>
            <Pdf
              file={fileUrl}
              loading={<CircularProgress size={'1.8rem'} />}
              onLoadProgress={() => setStepperState({ ...stepperState, loading: true })}
              onLoadSuccess={onLoadEnd}
            >
              <PdfPage pageNumber={1} />
            </Pdf>
          </StepContent>
        </Step>
      ))}
    </Stepper>
  );
};
