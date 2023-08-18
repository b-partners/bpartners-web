import { Button, CircularProgress } from '@mui/material';
import { EditorState } from 'draft-js';
import { useState } from 'react';
import { useNotify } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { RichTextForm } from 'src/common/components/RichTextForm';
import { invoiceRelaunchResolver } from 'src/common/resolvers';
import { useInvoiceToolContext } from 'src/common/store/invoice';
import { handleSubmit } from 'src/common/utils';
import { authProvider, getCached, payingApi } from 'src/providers';
import { InvoiceListModal } from '.';
import { invoiceGetContext } from '../utils';
import { InvoiceModalTitle } from './InvoiceModalTitle';

const invoiceRelaunchDefaultValue: any = {
  subject: '',
  message: EditorState.createEmpty(),
  attachments: [],
};

export const InvoiceRelaunchModal = () => {
  const notify = useNotify();
  const [isLoading, setIsLoading] = useState(false);
  const {
    closeModal,
    modal: { invoice },
    openModal,
  } = useInvoiceToolContext();
  const form = useForm({ mode: 'all', defaultValues: invoiceRelaunchDefaultValue, resolver: invoiceRelaunchResolver });

  const relaunchInvoiceSubmit = form.handleSubmit(data => {
    const userId = authProvider.getCachedWhoami().user.id;

    const fetch = async () => {
      if (userId) {
        setIsLoading(true);
        const { accountId } = getCached.userInfo();
        await payingApi().relaunchInvoice(accountId, invoice.id, data as any);
        notify(`${invoiceGetContext(invoice, 'Le', 'La')} ref: ${invoice?.ref} a été relancé avec succès.`, { type: 'success' });
        closeModal();
        setIsLoading(false);
      }
    };
    fetch().catch(() => notify('messages.global.error', { type: 'error' }));
  });

  return (
    <FormProvider {...form}>
      <InvoiceListModal
        type='RELAUNCH'
        title={<InvoiceModalTitle invoice={invoice} label='Relance manuelle' />}
        actions={
          <>
            <Button data-cy='invoice-relaunch-history' onClick={() => openModal({ invoice, isOpen: true, type: 'RELAUNCH_HISTORY' })}>
              Historique des relances
            </Button>
            <Button
              disabled={isLoading}
              data-cy='invoice-relaunch-submit'
              onClick={handleSubmit(relaunchInvoiceSubmit)}
              startIcon={isLoading && <CircularProgress color='inherit' size={18} />}
            >
              Relancer {invoiceGetContext(invoice, 'ce', 'cette')}
            </Button>
          </>
        }
      >
        <RichTextForm attachments={true} />
      </InvoiceListModal>
    </FormProvider>
  );
};
