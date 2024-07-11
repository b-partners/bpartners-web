import { Card, CardContent, CardHeader } from '@mui/material';
import { CancelButton, ContextCancelButton } from './InvoicePdfDocument';

const TransactionSupportingDoc = ({ onClose, url }) => {
  return (
    <Card sx={{ border: 'none' }}>
      <CardHeader title='Justificatif' action={onClose ? <CancelButton onClose={onClose} /> : <ContextCancelButton />} />
      <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
        <img src={url} alt='document justificatif' width={window.screen.width * 0.7} loading='lazy' />
      </CardContent>
    </Card>
  );
};

export default TransactionSupportingDoc;
