import { ReactElement } from 'react';
import { View as InvoiceViewType, useInvoiceToolContext } from 'src/common/store/invoice';

type InvoiceViewProps = {
  children: ReactElement;
  type: InvoiceViewType[];
};

export const InvoiceView = (props: InvoiceViewProps) => {
  const { children, type } = props;
  const { view } = useInvoiceToolContext();

  return <>{type.includes(view) && children}</>;
};
