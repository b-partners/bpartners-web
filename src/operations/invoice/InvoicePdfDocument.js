import { Clear } from '@mui/icons-material';
import { Card, CardContent, CardHeader, IconButton, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import PdfViewer from '../../common/components/PdfViewer';
import { getInvoicePdfUrl, PDF_WIDTH } from './utils/utils';
import { useInvoiceContext } from 'src/common/hooks';

export const CancelButton = ({ onClick }) => (
  <Tooltip title='Retourner a la liste'>
    <IconButton onClick={onClick}>
      <Clear />
    </IconButton>
  </Tooltip>
);

const InvoicePdfDocument = () => {
  const {
    setView,
    state: { invoice, documentUrl: invoiceFileId },
  } = useInvoiceContext();
  const [documentUrl, setDocumentUrl] = useState('');
  useEffect(() => {
    const pdfUrl = getInvoicePdfUrl(invoiceFileId);
    setDocumentUrl(pdfUrl);
  }, [invoiceFileId]);

  return (
    <Card sx={{ border: 'none' }}>
      <CardHeader action={<CancelButton onClick={() => setView('list')} />} title={invoice?.title} subheader={invoice?.ref} />
      <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
        <PdfViewer width={PDF_WIDTH} url={documentUrl} filename={invoice?.ref} />
      </CardContent>
    </Card>
  );
};

export default InvoicePdfDocument;
