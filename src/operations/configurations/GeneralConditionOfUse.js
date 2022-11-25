import {
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { ArrowLeft, ArrowRight } from '@material-ui/icons';
import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { Document as Pdf, Page as PdfPage } from 'react-pdf/dist/esm/entry.webpack';
import { BP_COLOR } from 'src/bpTheme';
import { userAccountsApi } from '../../providers/api';
import AuthProvider from '../../providers/auth-provider';
import { ErrorHandling } from '../utils/PdfViewer';
import { reload } from '../../utils/reload';

export const GeneralConditionOfUse = () => {
  const userId = AuthProvider.getCachedWhoami()?.user?.id;

  const notify = useNotify();

  const [loading, setLoading] = useState(false);
  const [legalFiles, setLegalFiles] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [cguDialogStatus, setCguDialogStatus] = useState(false);

  useEffect(() => {
    const fetchLegalFiles = async () => {
      if (userId) {
        try {
          setLoading(true);
          const legalFilesTemp = (await userAccountsApi().getLegalFiles(userId)).data;
          const onlyNotApprovedLegalFiles = legalFilesTemp.filter(lf => !lf.approvalDatetime);

          localStorage.setItem('unapprovedFiles', onlyNotApprovedLegalFiles.length);

          setLegalFiles([...onlyNotApprovedLegalFiles]);

          if (onlyNotApprovedLegalFiles.length > 0) {
            setCguDialogStatus(true);
          }
        } catch (e) {
          notify("Une erreur s'est produite", { type: 'error' });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLegalFiles();
  }, [userId, notify]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await approveLegalFile();

      activeStep === legalFiles.length - 1 ? reload() : setActiveStep(prevActiveStep => prevActiveStep + 1);
    } catch (e) {
      notify("Une erreur s'est produite", { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const approveLegalFile = () => userAccountsApi().approveLegalFile(userId, legalFiles[activeStep].id);

  return (
    <Dialog
      open={cguDialogStatus}
      data-testid='cgu-dialog'
      scroll='paper'
      fullWidth
      maxWidth='md'
      sx={{
        backdropFilter: 'blur(0.1rem)',
      }}
    >
      <DialogTitle>
        <Stack direction='row' justifyContent='space-between'>
          <Typography variant='subtitle1'>Votre approbation est requise</Typography>
          {loading && <CircularProgress size={'1.8rem'} />}
        </Stack>
      </DialogTitle>

      {(legalFiles || []).length > 0 && (
        <>
          <DialogContent dividers={true}>
            <StepLegalFiles activeStep={activeStep} legalFiles={legalFiles} setLoading={setLoading} />
          </DialogContent>

          <DialogActions>
            <Button name='lf-next-button' type='button' disabled={loading} onClick={handleSubmit}>
              {activeStep === legalFiles.length - 1 ? 'Accepter' : 'Accepter et continuer'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

const StepLegalFiles = ({ setLoading, activeStep, legalFiles }) => {
  const notify = useNotify();
  const [totalPage, setTotalPage] = useState(0);
  const [actualPage, setActualPage] = useState(1);

  const navigatePage = actions => {
    setActualPage(prevActualPage => (actions === 'prev' ? prevActualPage - 1 : prevActualPage + 1));
  };

  const onLoad = () => {
    setLoading(false);
  };

  useEffect(() => setLoading(true), [activeStep]);

  return (
    <Stepper activeStep={activeStep} orientation='vertical'>
      {legalFiles.map(({ fileUrl, name }, index) => (
        <Step key={name}>
          <StepLabel>
            {name}

            {totalPage > 0 && (
              <>
                <IconButton data-item={`pdf-prev-${index}`} disabled={actualPage <= 1} onClick={() => navigatePage('prev')}>
                  <ArrowLeft />
                </IconButton>
                {actualPage} - {totalPage}
                <IconButton data-item={`pdf-next-${index}`} disabled={actualPage === totalPage} onClick={() => navigatePage('next')}>
                  <ArrowRight />
                </IconButton>
              </>
            )}
          </StepLabel>
          <StepContent
            sx={{
              maxHeight: '25rem',
              overflowY: 'scroll',
              borderLeft: `1px solid ${BP_COLOR['solid_grey']}`,
            }}
          >
            <Pdf
              file={fileUrl}
              error={<ErrorHandling errorMessage={'Echec de chargement du document'} />}
              loading={<CircularProgress size={'1.8rem'} />}
              onLoadSuccess={({ numPages }) => {
                setTotalPage(numPages);
                onLoad();
              }}
              onLoadError={onLoad}
            >
              <PdfPage pageNumber={actualPage} />
            </Pdf>
          </StepContent>
        </Step>
      ))}
    </Stepper>
  );
};
