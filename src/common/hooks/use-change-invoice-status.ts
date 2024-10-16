import { invoiceMapper } from '@/operations/invoice/utils/invoice-utils';
import { draftInvoiceValidator, InvoiceFieldErrorMessage } from '@/operations/invoice/utils/utils';
import { invoiceProvider } from '@/providers';
import { Invoice, InvoiceStatus } from '@bpartners/typescript-client';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { useInvoiceToolContext } from '../store/invoice';
import { handleSubmit } from '../utils';

const getNextTab = (type: InvoiceStatus) => {
  switch (type) {
    case 'PROPOSAL':
      return 1;
    case 'CONFIRMED':
      return 2;
    case 'PAID':
      return 2;
  }
};

export const useChangeInvoiceStatus = (invoice: Invoice, convertTo: InvoiceStatus, successMessage: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { openModal, setTab } = useInvoiceToolContext();
  const notify = useNotify();
  const refresh = useRefresh();

  const fetch = async (e: ClipboardEvent) => {
    e.stopPropagation();
    if (convertTo === 'PROPOSAL' && !draftInvoiceValidator(invoice)) {
      notify(InvoiceFieldErrorMessage, { type: 'error' });
    } else {
      setIsLoading(true);
      try {
        await invoiceProvider.saveOrUpdate([invoiceMapper.toDomain({ ...invoice, status: convertTo })], { isEdition: true });
        refresh();
        setTab(null, getNextTab(convertTo));
        if (convertTo === 'PAID') {
          openModal({ invoice, isOpen: true, type: 'FEEDBACK' });
        }
        notify(successMessage, { type: 'success' });
      } catch (err) {
        notify((err as AxiosError).message, { type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return { isLoading, fetch: handleSubmit(fetch) };
};
