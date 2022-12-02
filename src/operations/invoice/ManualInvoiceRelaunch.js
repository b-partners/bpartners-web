import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { RichTextInput } from 'ra-input-rich-text';
import { Edit, required, SimpleForm, TextInput, useNotify } from 'react-admin';
import { singleAccountGetter } from '../../providers/account-provider';
import { payingApi } from '../../providers/api';
import authProvider from '../../providers/auth-provider';

export const ManualInvoiceRelaunch = ({ invoice = null, resetInvoice }) => {
  const onClose = () => {
    resetInvoice();
  };

  return (
    invoice && (
      <Dialog open={invoice} onClose={onClose} maxWidth='md'>
        <DialogTitle>
          Relance manuelle du {invoice.status === 'PROPOSAL' ? 'dévis' : 'facture'} ref: {invoice.ref}
        </DialogTitle>
        <DialogContent>
          <InvoiceRelaunchForm />
        </DialogContent>
      </Dialog>
    )
  );
};

// edit to get the context in which data is stored to avoid hard coding ra-input-rich-text
const InvoiceRelaunchForm = ({ iId, ...rest }) => {
  const notify = useNotify();

  const handleSubmit = async data => {
    console.log(data);
    const userId = authProvider.getCachedWhoami().user.id;
    if (userId) {
      try {
        const aId = (await singleAccountGetter(userId)).id;
        await payingApi().relaunchInvoice(aId, iId, data);
        notify('Le facture a bien été relancé avec succès', { type: 'success' });
      } catch (e) {
        notify("Une erreur s'est produite", { type: 'error' });
      }
    }
  };

  return (
    <Edit {...rest} resource='invoices'>
      <SimpleForm onSubmit={handleSubmit}>
        <TextInput source='object' name='object' label='object' fullWidth validate={required()} />
        <RichTextInput source='message' name='message' label='message' vaidate={[required()]} />
      </SimpleForm>
    </Edit>
  );
};
