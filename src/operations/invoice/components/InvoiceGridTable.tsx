import { RaMoneyField } from '@/common/components';
import { useAreaPictureFetcher } from '@/common/fetcher';
import useGetAccountHolder from '@/common/hooks/use-get-account-holder';
import { useInvoiceToolContext } from '@/common/store/invoice';
import { formatDate } from '@/common/utils';
import { Invoice, InvoiceStatus } from '@bpartners/typescript-client';
import { Typography } from '@mui/material';
import { FC, MouseEvent, useEffect } from 'react';
import { Datagrid, FunctionField, RowClickFunction, TextField, useListContext } from 'react-admin';
import { getInvoiceStatusInFr } from '../utils';
import { InvoiceListActionsButtonsRenderer } from './InvoiceListActionsButtonRenderer';

interface InvoiceGridTableProps {
  crupdateInvoice: (invoice: Invoice) => void;
  viewPdf: (event: MouseEvent, data: Invoice) => void;
}

export const InvoiceGridTable: FC<InvoiceGridTableProps> = props => {
  const { crupdateInvoice, viewPdf: setPdf } = props;
  const { isLoading, refetch } = useListContext();
  const { setView, view } = useInvoiceToolContext();

  const { mutate: areaPictureFetcher, isPending: areaPictureFetcherLoading } = useAreaPictureFetcher(crupdateInvoice);
  const { companyInfo } = useGetAccountHolder();

  const nameRenderer = ({ customer }: Invoice) => <Typography>{`${customer.name}`}</Typography>;

  const editInvoice: RowClickFunction = async (_id, _resourceName, record) => {
    const invoice = { ...record } as Invoice;
    if (record.status !== InvoiceStatus.DRAFT) {
      return;
    }
    crupdateInvoice(invoice);
    setView('edition');
    if (record.idAreaPicture) {
      areaPictureFetcher({ areaPictureId: record.idAreaPicture, invoice });
      return '';
    }
  };

  const viewPdf = (event: MouseEvent, data: Invoice) => {
    setPdf(event, data);
    setView('preview');
    if (data.idAreaPicture) {
      return areaPictureFetcher({ areaPictureId: data.idAreaPicture, invoice: { ...data } });
    }
  };

  useEffect(() => {
    refetch();
  }, [view]);

  if (isLoading && areaPictureFetcherLoading) {
    return null;
  }

  return (
    <Datagrid rowClick={editInvoice}>
      <TextField source='ref' label='Référence' />
      <TextField source='title' label='Titre' />
      <FunctionField render={nameRenderer} label='Client' />
      <RaMoneyField render={data => (companyInfo?.isSubjectToVat ? data.totalPriceWithVat : data.totalPriceWithoutVat)} label='Prix TTC' variant='body2' />
      <FunctionField render={data => <Typography variant='body2'>{getInvoiceStatusInFr(data.status)}</Typography>} label='Statut' />
      <FunctionField render={record => formatDate(new Date(record.sendingDate))} label="Date d'émission" />
      <FunctionField render={data => <InvoiceListActionsButtonsRenderer record={data} viewPdf={viewPdf} />} label='' />
    </Datagrid>
  );
};
