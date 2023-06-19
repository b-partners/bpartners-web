import { Clear } from '@mui/icons-material';
import { Card, CardContent, CardHeader, IconButton, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import PdfViewer from '../../common/components/PdfViewer';
import { getInvoicePdfUrl, PDF_WIDTH } from './utils/utils';
import { printError } from 'src/common/utils';
import { useInvoiceToolContext } from 'src/common/store/invoice';

export const CancelButton = ({ onClose }) => {
  return (
    <Tooltip title='Retourner a la liste'>
      <IconButton onClick={onClose}>
        <Clear />
      </IconButton>
    </Tooltip>
  );
};

export const ContextCancelButton = () => {
  const { setView } = useInvoiceToolContext();
  return <CancelButton onClose={() => setView('list')} />;
};

const InvoicePdfDocument = ({ selectedInvoice, onClose }) => {
  const [documentUrl, setDocumentUrl] = useState('');

  useEffect(() => {
    getInvoicePdfUrl(selectedInvoice.fileId)
      .then(pdfUrl => setDocumentUrl(pdfUrl))
      .catch(printError);
  }, [selectedInvoice]);

  return (
    <Card sx={{ border: 'none' }}>
      <CardHeader
        action={onClose ? <CancelButton onClose={onClose} /> : <ContextCancelButton />}
        title={selectedInvoice.title}
        subheader={selectedInvoice.ref}
      />
      <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
        <PdfViewer width={PDF_WIDTH} url={documentUrl} filename={selectedInvoice.ref} />
      </CardContent>
    </Card>
  );
};

export default InvoicePdfDocument;
