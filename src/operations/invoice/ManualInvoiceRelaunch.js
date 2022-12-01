import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { RichTextInput } from 'ra-input-rich-text';
import { Edit, required, SimpleForm, TextInput } from 'react-admin';

export const ManualInvoiceRelaunch = ({ invoice = null, resetInvoice }) => {
  const onClose = () => {
    resetInvoice();
  };

  return (
    invoice && (
      <Dialog open={invoice} onClose={onClose} maxWidth='md'>
        <DialogTitle>Relance manuelle du dévis {invoice.ref}</DialogTitle>
        <DialogContent>
          <InvoiceRelaunchForm />
        </DialogContent>
      </Dialog>
    )
  );
};

// edit to get the context in which data is stored to avoid hard coding ra-input-rich-text
const InvoiceRelaunchForm = props => {
  return (
    <Edit {...props} resource='invoice'>
      <SimpleForm onSubmit={data => console.log(data)}>
        <TextInput source='subject' name='subject' label='objet' fullWidth validate={required()} />
        <RichTextInput source='body' name='body' label='corps' vaidate={required()} />
      </SimpleForm>
    </Edit>
  );
};
