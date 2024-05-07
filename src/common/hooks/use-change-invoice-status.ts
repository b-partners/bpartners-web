import { Invoice, InvoiceStatus } from '@bpartners/typescript-client';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { invoiceMapper } from 'src/operations/invoice/utils/invoice-utils';
import { draftInvoiceValidator, InvoiceFieldErrorMessage } from 'src/operations/invoice/utils/utils';
import { invoiceProvider } from 'src/providers';
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
  const [isLoading, setLoading] = useState(false);
  const { openModal, setTab } = useInvoiceToolContext();
  const notify = useNotify();
  const refresh = useRefresh();

  const fetch = async (e: ClipboardEvent) => {
    e.stopPropagation();
    if (convertTo === 'PROPOSAL' && !draftInvoiceValidator(invoice)) {
      notify(InvoiceFieldErrorMessage, { type: 'error' });
    } else {
      setLoading(true);
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
        setLoading(false);
      }
    }
  };

  return { isLoading, fetch: handleSubmit(fetch) };
};
