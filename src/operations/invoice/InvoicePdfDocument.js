import { Clear } from '@mui/icons-material';
import { Card, CardContent, CardHeader, IconButton, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from 'react';
import PdfViewer from '../../common/components/PdfViewer';
import { getInvoicePdfUrl, PDF_WIDTH } from './utils';

const useStyle = makeStyles(() => ({
  card: { border: 'none' },
  form: { transform: 'translateY(-1rem)' },
}));

export const CancelButton = ({ onClick }) => (
  <Tooltip title='Retourner a la liste'>
    <IconButton onClick={onClick}>
      <Clear />
    </IconButton>
  </Tooltip>
);

const InvoicePdfDocument = ({ selectedInvoice, onClose }) => {
  const [documentUrl, setDocumentUrl] = useState('');
  const classes = useStyle();

  useEffect(() => {
    getInvoicePdfUrl(selectedInvoice.fileId).then(pdfUrl => setDocumentUrl(pdfUrl));
  }, [selectedInvoice]);

  return (
    <Card className={classes.card}>
      <CardHeader action={<CancelButton onClick={onClose} />} title={selectedInvoice.title} subheader={selectedInvoice.ref} />
      <CardContent>
        <PdfViewer width={PDF_WIDTH} url={documentUrl} filename={selectedInvoice.ref} />
      </CardContent>
    </Card>
  );
};

export default InvoicePdfDocument;
