/* eslint-disable react-hooks/exhaustive-deps */
import { Button, CircularProgress } from '@mui/material';
import { EditorState } from 'draft-js';
import { useEffect, useState } from 'react';
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
import { getRelaunchDefaultMessage } from '../utils/utils';

export const InvoiceRelaunchModal = () => {
  const [isLoading, setIsLoading] = useState(false);

  const notify = useNotify();

  const { name: companyName } = getCached.accountHolder() || {};

  const {
    closeModal,
    modal: { invoice },
    openModal,
  } = useInvoiceToolContext();
  const form = useForm({
    mode: 'all',
    defaultValues: { subject: `[${companyName}] -  Relance ${invoice?.title || ''}`, message: EditorState.createEmpty(), attachments: [] },
    resolver: invoiceRelaunchResolver,
  });

  useEffect(() => {
    form.setValue('message', getRelaunchDefaultMessage(invoice));
  }, [invoice]);

  const relaunchInvoiceSubmit = form.handleSubmit(data => {
    const userId = authProvider.getCachedWhoami().user.id;

    const fetch = async () => {
      if (userId) {
        setIsLoading(true);
        const { accountId } = getCached.userInfo();
        await payingApi().relaunchInvoice(accountId, invoice.id, { ...data, isFromScratch: true } as any);
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
