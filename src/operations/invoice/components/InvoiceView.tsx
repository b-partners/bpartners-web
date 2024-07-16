import { View as InvoiceViewType, useInvoiceToolContext } from '@/common/store/invoice';
import { ReactElement } from 'react';

type InvoiceViewProps = {
  children: ReactElement;
  type: InvoiceViewType[];
};

export const InvoiceView = (props: InvoiceViewProps) => {
  const { children, type } = props;
  const { view } = useInvoiceToolContext();

  return <>{type.includes(view) && children}</>;
};
