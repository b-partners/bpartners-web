import { Clear } from '@mui/icons-material';
import { Card, CardContent, CardHeader, IconButton, Tooltip } from '@mui/material';
import { useInvoiceToolContext } from 'src/common/store/invoice';

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

const TransactionSupportingDoc = ({ selectedDoc, onClose, url }) => {
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
