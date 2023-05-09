import { Clear } from '@mui/icons-material';
import { Card, CardContent, CardHeader, IconButton, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import PdfViewer from '../../common/components/PdfViewer';
import { getInvoicePdfUrl, PDF_WIDTH } from './utils/utils';

export const CancelButton = ({ onClick }) => (
  <Tooltip title='Retourner a la liste'>
    <IconButton onClick={onClick}>
      <Clear />
    </IconButton>
  </Tooltip>
);

const InvoicePdfDocument = ({ selectedInvoice, onClose }) => {
  const [documentUrl, setDocumentUrl] = useState('');

  useEffect(() => {
    getInvoicePdfUrl(selectedInvoice.fileId).then(pdfUrl => setDocumentUrl(pdfUrl));
  }, [selectedInvoice]);

  return (
    <Card sx={{ border: 'none' }}>
      <CardHeader action={<CancelButton onClick={onClose} />} title={selectedInvoice.title} subheader={selectedInvoice.ref} />
      <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
        <PdfViewer width={PDF_WIDTH} url={documentUrl} filename={selectedInvoice.ref} />
      </CardContent>
    </Card>
  );
};

export default InvoicePdfDocument;
