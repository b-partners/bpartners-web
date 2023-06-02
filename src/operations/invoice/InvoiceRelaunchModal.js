import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useState } from 'react';
import { useNotify } from 'react-admin';
import { RichTextForm } from 'src/common/components/RichTextForm';
import { handleSubmit } from 'src/common/utils';
import { authProvider, getCached, payingApi } from 'src/providers';
import { useForm, FormProvider } from 'react-hook-form';
import { invoiceRelaunchResolver } from 'src/common/resolvers';
import { EditorState } from 'draft-js';

const invoiceRelaunchDefaultValue = {
  subject: '',
  message: EditorState.createEmpty(),
  attachments: [],
};

const InvoiceRelaunchModal = ({ invoice = null, resetInvoice }) => {
  const notify = useNotify();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({ mode: 'all', defaultValues: invoiceRelaunchDefaultValue, resolver: invoiceRelaunchResolver });

  const onClose = () => {
    resetInvoice();
    form.setValue('attachments', []);
  };

  const getContext = ({ devis, facture }) => (invoice.status === 'PROPOSAL' ? `${devis} devis` : `${facture} facture`);

  const relaunchInvoiceSubmit = form.handleSubmit(data => {
    const userId = authProvider.getCachedWhoami().user.id;
    const fetch = async _event => {
      if (userId) {
        setIsLoading(true);
        const { accountId } = getCached.userInfo();
        await payingApi().relaunchInvoice(accountId, invoice.id, data);
        notify(
          `${getContext({
            devis: 'Le',
            facture: 'La',
          })} ref: ${invoice.ref} a été relancée avec succès.`,
          { type: 'success' }
        );
        resetInvoice();
        setIsLoading(false);
      }
    };
    fetch().catch(() => notify('messages.global.error', { type: 'error' }));
  });

  return (
    invoice && (
      <FormProvider {...form}>
        <Dialog open={!!invoice} onClose={onClose} maxWidth='lg'>
          <DialogTitle>
            Relance manuelle {getContext({ devis: 'du', facture: 'de la' })} ref: {invoice.ref}
          </DialogTitle>
          <DialogContent>
            <RichTextForm attachments={true} />
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button
              disabled={isLoading}
              data-cy='invoice-relaunch-submit'
              onClick={handleSubmit(relaunchInvoiceSubmit)}
              startIcon={isLoading && <CircularProgress color='inherit' size={18} />}
            >
              Relancer {getContext({ devis: 'ce', facture: 'cette' })}
            </Button>
          </DialogActions>
        </Dialog>
      </FormProvider>
    )
  );
};

export default InvoiceRelaunchModal;
