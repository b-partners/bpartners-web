import { Typography, Box, Dialog, DialogContent, DialogActions, DialogTitle, TextField, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { singleAccountGetter } from '../../providers/account-provider';
import { payingApi, userAccountsApi } from '../../providers/api';
import authProvider from '../../providers/auth-provider';
import RichTextEditor from '../utils/RichTextEditor';

export const ManualInvoiceRelaunch = ({ invoice = null, resetInvoice }) => {
  const notify = useNotify();
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');

  const onClose = () => {
    resetInvoice();
  };

  const getContext = () => (invoice.status === 'PROPOSAL' ? 'dévis' : 'facture');

  const handleSubmit = async () => {
    const userId = authProvider.getCachedWhoami().user.id;
    if (userId) {
      try {
        const aId = (await singleAccountGetter(userId)).id;
        await payingApi().relaunchInvoice(aId, invoice.id, { message, subject });
        notify(`Le ${getContext()} ref ${invoice.ref} a bien été relancé avec succès.`, { type: 'success' });
        resetInvoice();
      } catch (e) {
        notify("Une erreur s'est produite", { type: 'error' });
      }
    }
  };

  return (
    invoice && (
      <Dialog open={invoice} onClose={onClose} maxWidth='lg'>
        <DialogTitle>
          Relance manuelle du {getContext()} ref: {invoice.ref}
        </DialogTitle>
        <DialogContent>
          <InvoiceRelaunchForm setMessage={setMessage} setSubject={setSubject} />
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={handleSubmit}>Relancer ce {getContext()}</Button>
        </DialogActions>
      </Dialog>
    )
  );
};

// edit to get the context in which data is stored to avoid hard coding ra-input-rich-text
const InvoiceRelaunchForm = ({ setMessage, setSubject }) => {
  const handleChange = ({ target }) => setSubject(target.value);

  return (
    <Box>
      <TextField name='object' label='Objet' fullWidth onChange={handleChange} />
      <Box sx={{ mt: 2 }}>
        <Typography variant='subtitle1' mb={2}>
          Message
        </Typography>
        <RichTextEditor placeholder='corps de votre message' setContent={setMessage} />
      </Box>
    </Box>
  );
};
