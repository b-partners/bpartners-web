/* eslint-disable react-hooks/exhaustive-deps */
import { RichTextForm } from '@/common/components/RichTextForm';
import { invoiceRelaunchResolver } from '@/common/resolvers';
import { useInvoiceToolContext } from '@/common/store/invoice';
import { handleSubmit } from '@/common/utils';
import { authProvider, getCached, payingApi } from '@/providers';
import { Button, CircularProgress, LinearProgress } from '@mui/material';
import { EditorState } from 'draft-js';
import { useEffect, useState } from 'react';
import { ListContextProvider, useListController, useNotify } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { InvoiceListModal } from '.';
import { getEmailSubject, getRelaunchDefaultMessage, invoiceGetContext } from '../utils';
import { InvoiceModalTitle } from './InvoiceModalTitle';

export const InvoiceRelaunchModal = () => {
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const notify = useNotify();

  const {
    closeModal,
    modal: { invoice },
    openModal,
  } = useInvoiceToolContext();
  const form = useForm({
    mode: 'all',
    defaultValues: { subject: getEmailSubject(invoice, false), message: EditorState.createEmpty(), attachments: [] },
    resolver: invoiceRelaunchResolver,
  });
  const invoiceRelaunchListController = useListController({ resource: 'invoiceRelaunch', perPage: 10, filter: { invoiceId: invoice?.id || '' } });

  const { data, isLoading, isFetching } = invoiceRelaunchListController;

  useEffect(() => {
    if ((data?.length || 0) === 0) {
      form.setValue('message', getRelaunchDefaultMessage(invoice, false));
      form.setValue('subject', getEmailSubject(invoice, false));
    } else {
      form.setValue('message', getRelaunchDefaultMessage(invoice, true));
      form.setValue('subject', getEmailSubject(invoice, true));
    }
  }, [invoice, data]);

  const relaunchInvoiceSubmit = form.handleSubmit(datas => {
    const userId = authProvider.getCachedWhoami().user.id;

    const fetch = async () => {
      if (userId) {
        setIsLoadingSubmit(true);
        const { accountId } = getCached.userInfo();
        await payingApi().relaunchInvoice(accountId, invoice.id, { ...datas, isFromScratch: true } as any);
        const invoiceStatus = (data?.length || 0) === 0 ? 'envoyé' : 'relancé';
        notify(`${invoiceGetContext(invoice, 'Le', 'La')} ref: ${invoice?.ref} a été ${invoiceStatus} avec succès.`, { type: 'success' });
        closeModal();
        setIsLoadingSubmit(false);
      }
    };
    fetch().catch(() => notify('messages.global.error', { type: 'error' }));
  });

  return (
    <ListContextProvider value={invoiceRelaunchListController}>
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
                disabled={isLoadingSubmit}
                data-cy='invoice-relaunch-submit'
                onClick={handleSubmit(relaunchInvoiceSubmit)}
                startIcon={isLoadingSubmit && <CircularProgress color='inherit' size={18} />}
              >
                {(data?.length || 0) === 0 ? 'Envoyer' : 'Relancer'} {invoiceGetContext(invoice, 'ce', 'cette')}
              </Button>
            </>
          }
        >
          {(isFetching || isLoading) && <LinearProgress color='secondary' />}
          <RichTextForm attachments={true} />
        </InvoiceListModal>
      </FormProvider>
    </ListContextProvider>
  );
};
