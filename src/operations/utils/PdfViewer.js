import { Document as Pdf, Page as PdfPage } from 'react-pdf/dist/esm/entry.webpack';
import { Box, Card, CardHeader, CardContent, LinearProgress, Typography } from '@mui/material';
import { Error } from '@material-ui/icons';

const ErrorHandling = ({ errorMessage }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Error style={{ fontSize: 40 }} />
    <Typography variant='body2'>{errorMessage}</Typography>
  </Box>
);

const loadErrorMessage = "Une erreur s'est produite lors de l'affichage du document";

const PdfViewer = props => {
  const { url, isPending, noData, onLoadError, ...others } = props;
  return (
    <Box {...others}>
      <Card>
        {isPending && <LinearProgress />}
        <CardHeader title='Justificatif' />
        <CardContent>
          {url ? (
            <Pdf
              noData={noData || <Typography variant='body2'>En attente du document ...</Typography>}
              error={onLoadError || <ErrorHandling errorMessage={loadErrorMessage} />}
              loading={<Typography variant='body2'>Chargement du document ...</Typography>}
              file={url}
            >
              <PdfPage pageNumber={1} />
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
