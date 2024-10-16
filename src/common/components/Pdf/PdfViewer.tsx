import { DownloadForOffline } from '@mui/icons-material';
import { Box, Card, CardContent, CardHeader, LinearProgress, Stack, Typography } from '@mui/material';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Document as Pdf, Page as PdfPage } from 'react-pdf/dist/esm/entry.vite';
import { HorizontalPagination } from '../HorizontalPagination';
import TooltipButton from '../TooltipButton';
import { PdfErrorHandling } from './PdfErrorHandling';
import { PdfViewerProps } from './types';

export const PdfViewer: FC<PdfViewerProps> = props => {
  const { url, filename, isPending, noData, onLoadError, children, ...others } = props;
  const loadErrorMessage = 'Échec de chargement du document';
  const [pages, setPages] = useState({ current: 1, last: null });
  const [isLoading, setIsLoading] = useState(true);
  const pdfRef = useRef(null);

  const stopLoading = () => setIsLoading(false);
  const startLoading = useCallback(() => setIsLoading(true), [setIsLoading]);

  const setLastPage = ({ numPages }: any) => {
    setPages(e => ({ ...e, last: numPages }));
  };

  const setPage = (callback: any) => {
    setPages(e => ({ ...e, current: callback(e.current) }));
  };

  useEffect(() => {
    startLoading();
  }, [url, startLoading]);
  return (
    <Box {...others}>
      <Card ref={pdfRef}>
        {isPending && <LinearProgress />}
        <Box display='flex' justifyContent='space-between'>
          <CardHeader title='Justificatif' />
          <Stack flexDirection='row' sx={{ alignItems: 'center', padding: '0.2rem 0.2rem 0 0' }}>
            {url && !isLoading && <HorizontalPagination activeStep={pages.current} maxSteps={pages.last} setActiveStep={setPage} />}
            {children}
            <a href={url} target='_blank' rel='noreferrer' download={filename + '.pdf'}>
              <TooltipButton title='Télécharger' icon={<DownloadForOffline />} />
            </a>
          </Stack>
        </Box>
        <CardContent sx={{ ...(url && !isLoading && { paddingInline: 0 }), justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
          {url ? (
            <Pdf
              noData={noData || <Typography variant='body2'>En attente du document ...</Typography>}
              error={onLoadError || <PdfErrorHandling message={loadErrorMessage} />}
              loading={<LoadingMessage />}
              file={!isPending ? url : null}
              onLoadSuccess={setLastPage}
            >
              <PdfPage
                loading={<LoadingMessage />}
                onLoadSuccess={stopLoading}
                width={pdfRef.current && pdfRef.current.clientWidth - 50}
                pageNumber={pages.current}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                customTextRenderer={false}
              />
            </Pdf>
          ) : (
            <Typography variant='body2'>En attente du document ...</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

const LoadingMessage = () => <Typography variant='body2'>Chargement du document ...</Typography>;
