import { Document as Pdf, Page as PdfPage } from 'react-pdf/dist/esm/entry.webpack';
import { Box, Card, CardHeader, CardContent, LinearProgress, Typography } from '@mui/material';
import { Error } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core';

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
  const { url, isPending, noData, onLoadError, width, ...others } = props;
  const loadErrorMessage = 'Echec de chargement du document';
  const classes = useStyle();

  return (
    <Box {...others}>
      <Card>
        {isPending && <LinearProgress />}
        <CardHeader title='Justificatif' />
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
