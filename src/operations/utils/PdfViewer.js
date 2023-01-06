import { Document as Pdf, Page as PdfPage } from 'react-pdf/dist/esm/entry.webpack';
import { Box, Card, CardHeader, CardContent, LinearProgress, Typography } from '@mui/material';
import { Error, DownloadForOffline } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';

import TooltipButton from './TooltipButton';

export const ErrorHandling = ({ errorMessage }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Error style={{ fontSize: 40 }} />
    <Typography variant='body2'>{errorMessage}</Typography>
  </Box>
);

const useStyle = makeStyles(() => ({
  pdf: {
    width: '100%',
  },
}));

const PdfViewer = props => {
  const { url, filename, isPending, noData, onLoadError, width, ...others } = props;
  const loadErrorMessage = 'Echec de chargement du document';
  const classes = useStyle();

  return (
    <Box {...others}>
      <Card>
        {isPending && <LinearProgress />}
        <Box display='flex' justifyContent='space-between'>
          <CardHeader title='Justificatif' />
          <a href={url} target='_blank' rel='noreferrer' download={filename + '.pdf'} style={{ marginTop: '0.5em' }}>
            <TooltipButton title='Télécharger' icon={<DownloadForOffline />} />
          </a>
        </Box>
        <CardContent>
          {url ? (
            <Pdf
              className={classes.pdf}
              noData={noData || <Typography variant='body2'>En attente du document ...</Typography>}
              error={onLoadError || <ErrorHandling errorMessage={loadErrorMessage} />}
              loading={<Typography variant='body2'>Chargement du document ...</Typography>}
              file={!isPending ? url : null}
            >
              <PdfPage className={classes.pdf} width={width} pageNumber={1} />
            </Pdf>
          ) : (
            <Typography variant='body2'>En attente du document ...</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PdfViewer;
