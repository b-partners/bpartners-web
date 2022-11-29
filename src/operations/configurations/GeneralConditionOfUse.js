import { makeStyles } from '@material-ui/styles';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Skeleton, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { Document as Pdf, Page as PdfPage } from 'react-pdf/dist/esm/entry.webpack';
import { userAccountsApi } from '../../providers/api';
import AuthProvider from '../../providers/auth-provider';
import { reload } from '../../utils/reload';
import { EmptyList } from '../utils/EmptyList';
import { VerticalPagination } from '../utils/vertical-pagination';
import { DIALOG_CONTENT, LEGAL_FILE_TITLE, VERTICAL_PAGINATION } from './style';

const INIT_LEGALFILE = {
  id: '',
  name: '',
  fileUrl: 'dummy-url.com',
  approvalDatetime: null,
};

export const GeneralConditionOfUse = () => {
  const userId = AuthProvider.getCachedWhoami()?.user?.id;
  const notify = useNotify();

  const [loading, setLoading] = useState(false);
  const [activeLfIndex, setActiveLfIndex] = useState(0);
  const [legalFiles, setLegalFiles] = useState([]);
  const [legalFile, setLegalFile] = useState(INIT_LEGALFILE);
  const [cguDialogStatus, setCguDialogStatus] = useState(false);

  useEffect(() => {
    const fetchLegalFiles = async () => {
      if (userId) {
        try {
          setLoading(true);

          const lfTemp = (await userAccountsApi().getLegalFiles(userId)).data;

          const onlyNotApprovedLegalFiles = lfTemp.filter(lf => !lf.approvalDatetime);

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

  useEffect(() => {
    setLegalFile(legalFiles[activeLfIndex]);
  }, [activeLfIndex, legalFiles]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await approveLegalFile();

      activeLfIndex === legalFiles.length - 1 ? reload() : setActiveLfIndex(prevActiveLf => prevActiveLf + 1);
    } catch (e) {
      notify("Une erreur s'est produite", { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const approveLegalFile = () => userId && userAccountsApi().approveLegalFile(userId, legalFiles[activeLfIndex].id);

  return (
    <Dialog open={cguDialogStatus} fullScreen>
      <DialogTitle>
        <Stack flexDirection='row' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6'>Votre approbation est requise</Typography>
          <img src='./logo3292.png' alt='' width={30} />
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={DIALOG_CONTENT}>
        <GeneralConditionOfUseContent loading={loading} setLoading={setLoading} legalFile={legalFile} />
      </DialogContent>

      <DialogActions>
        <Button name='lf-next-button' type='button' disabled={false} onClick={handleSubmit}>
          {activeLfIndex === legalFiles.length - 1 ? 'Accepter' : 'Accepter et continuer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const useStyle = makeStyles(() => ({
  PDF: {
    '& .react-pdf__Page__canvas': {
      height: '45rem !important',
    },
    '& .react-pdf__Page__textContent, & .react-pdf__Page__annotations': {
      display: 'none',
    },
  },
}));

const GeneralConditionOfUseContent = ({ setLoading, loading, legalFile = INIT_LEGALFILE }) => {
  const classes = useStyle();
  const [activeStep, setActiveStep] = useState(1);
  const [maxSteps, setMaxSteps] = useState(0);

  const { fileUrl, name } = legalFile;

  useEffect(() => setLoading(true), [activeStep, setLoading]);

  return (
    <>
      <Box sx={{ paddingLeft: '0.3rem', height: '100%', width: '100%', maxWidth: 1200 }}>
        {!loading && (
          <>
            <Pdf
              file={fileUrl}
              renderMode='canvas'
              className={classes.PDF}
              error={<EmptyList content="Une erreur s'est produite" />}
              loading={<></>}
              onLoadSuccess={({ numPages }) => {
                setMaxSteps(numPages);
                maxSteps > 0 && setActiveStep(1);
                setLoading(false);
              }}
              onLoadError={() => setLoading(false)}
            >
              <PdfPage pageNumber={activeStep} />
            </Pdf>

            <Box sx={LEGAL_FILE_TITLE}>
              <Typography variant='body2'>{name}</Typography>
            </Box>
          </>
        )}

        {loading && (
          <>
            <Skeleton variant='text' height={20} width='60%' />
            <Skeleton variant='text' height={20} width='20%' />
            <Skeleton height='90%' variant='rectangular' />
          </>
        )}
      </Box>
      {maxSteps > 0 && <VerticalPagination activeStep={activeStep} maxSteps={maxSteps} setActiveStep={setActiveStep} boxSx={VERTICAL_PAGINATION} />}
    </>
  );
};
