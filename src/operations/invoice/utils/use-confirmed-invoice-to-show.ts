import { cache, getCached } from '@/providers';
import { InvoiceStatus } from '@bpartners/typescript-client';
import { useEffect, useState } from 'react';

const SHOW_ALL_STATUS = [InvoiceStatus.CONFIRMED, InvoiceStatus.PAID];
const SHOW_UNPAID_STATUS = [InvoiceStatus.CONFIRMED];

export const useConfirmedInvoiceToShow = () => {
  const [current, setCurrent] = useState(getCached.invoiceConfirmedListSwitch() ? SHOW_ALL_STATUS : SHOW_UNPAID_STATUS);

  useEffect(() => {
    cache.invoiceConfirmedListSwitch(current.length === 1);
  }, [current]);

  const toggleConfirmedInvoiceToShow = () => {
    setCurrent(current => (current.length === 1 ? SHOW_ALL_STATUS : SHOW_UNPAID_STATUS));
  };

  return { current, toggleConfirmedInvoiceToShow, switchValue: current.length === 1 };
};
