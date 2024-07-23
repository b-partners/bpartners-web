import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Skeleton, Stack, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { Document as Pdf, Page as PdfPage } from 'react-pdf/dist/esm/entry.vite';
import { VerticalPagination } from '@/common/components/VerticalPagination';
import { useWindowResize } from '@/common/hooks';
import { handleSubmit } from '@/common/utils';
import { EmptyList } from '../../common/components/EmptyList';
import { Reload } from '../../common/utils';
import { authProvider, cache, userAccountsApi } from '../../providers';
import { DIALOG_CONTENT, LEGAL_FILE_TITLE, VERTICAL_PAGINATION } from './style';

const INIT_LEGAL_FILE = {
  id: '',
  name: '',
  fileUrl: 'dummy-url.com',
  approvalDatetime: null,
};

export const GeneralConditionOfUse = () => {
  const userId = authProvider.getCachedWhoami()?.user?.id;
  const notify = useNotify();

  const [loading, setLoading] = useState(true);
  const [activeLfIndex, setActiveLfIndex] = useState(0);
  const [legalFiles, setLegalFiles] = useState([]);
  const [legalFile, setLegalFile] = useState(INIT_LEGAL_FILE);
  const [cguDialogStatus, setCguDialogStatus] = useState(false);

  useEffect(() => {
    const fetchLegalFiles = async () => {
      if (userId) {
        setLoading(true);

        const lfTemp = (await userAccountsApi().getLegalFiles(userId)).data;

        const onlyNotApprovedLegalFiles = lfTemp.filter(legalFile => legalFile.toBeConfirmed && !legalFile.approvalDatetime);

        cache.unapprovedFiles(onlyNotApprovedLegalFiles.length);

        setLegalFiles([...onlyNotApprovedLegalFiles]);

        if (onlyNotApprovedLegalFiles.length > 0) {
          setCguDialogStatus(true);
        }
      }
    };
    fetchLegalFiles()
      .catch(() => notify('messages.global.error', { type: 'error' }))
      .finally(() => setLoading(false));
  }, [userId, notify]);

  useEffect(() => {
    setLegalFile(legalFiles[activeLfIndex]);
  }, [activeLfIndex, legalFiles]);

  const approveLegalFileSubmit = async () => {
    try {
      setLoading(true);
      await approveLegalFile();

      activeLfIndex === legalFiles.length - 1 ? Reload.force() : setActiveLfIndex(prevActiveLf => prevActiveLf + 1);
    } catch (e) {
      notify('messages.global.error', { type: 'error' });
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
          <img src='./logo3292.webp' alt='' width={30} />
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={DIALOG_CONTENT}>
        <GeneralConditionOfUseContent loading={loading} setLoading={setLoading} legalFile={legalFile} />
      </DialogContent>

      <DialogActions>
        <Button name='lf-next-button' type='button' disabled={false} onClick={handleSubmit(approveLegalFileSubmit)}>
          {activeLfIndex === legalFiles.length - 1 ? 'Accepter' : 'Accepter et continuer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const useStyle = makeStyles(() => ({
  PDF: {
    '& .react-pdf__Page__canvas': {
      objectFit: 'cover',
      overflowY: 'scroll',
      boxShadow: '-1px 0px 16px -1px rgba(0,0,0,0.75)',
      marginBlock: '10%',
    },
    '& .react-pdf__Page__textContent, & .react-pdf__Page__annotations': {
      display: 'none',
    },
  },
}));

const GeneralConditionOfUseContent = ({ setLoading, loading, legalFile = INIT_LEGAL_FILE }) => {
  const classes = useStyle();
  const { width: windowWidth } = useWindowResize();
  const [activeStep, setActiveStep] = useState(1);
  const [maxSteps, setMaxSteps] = useState(0);

  const { fileUrl, name } = legalFile;

  return (
    <>
      <Box
        sx={{
          height: '100%',
          overflowY: 'scroll',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
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
              <PdfPage pageNumber={activeStep} width={Math.floor(windowWidth / 1.5)} />
            </Pdf>

            <Box sx={LEGAL_FILE_TITLE}>
              <Typography variant='body2'>{name}</Typography>
            </Box>
          </>
        )}

        {fileUrl === 'dummy-url.com' && (
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
