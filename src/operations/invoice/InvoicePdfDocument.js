import { Clear } from '@mui/icons-material';
import { Card, CardContent, CardHeader, IconButton, Tooltip } from '@mui/material';
import { useInvoiceToolContext } from 'src/common/store/invoice';
import PdfViewer from '../../common/components/PdfViewer';
import { PDF_WIDTH } from './utils/utils';

export const CancelButton = ({ onClose }) => {
  return (
    <Tooltip title='Retourner à la liste'>
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

const InvoicePdfDocument = ({ selectedInvoice, onClose, url }) => {
  return (
    <Card sx={{ border: 'none' }}>
      <CardHeader
        action={onClose ? <CancelButton onClose={onClose} /> : <ContextCancelButton />}
        title={selectedInvoice.title}
        subheader={selectedInvoice.ref}
      />
      <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
        <PdfViewer width={PDF_WIDTH} url={url} filename={selectedInvoice.ref} />
      </CardContent>
    </Card>
  );
};

export default InvoicePdfDocument;
