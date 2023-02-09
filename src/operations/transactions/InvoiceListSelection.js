import { InvoiceStatus } from 'bpartners-react-client';
import { Datagrid, ListContextProvider, TextField, useGetList, useList } from 'react-admin';
import useGetAccountHolder from '../utils/useGetAccountHolder';
import { Typography } from '@mui/material';

const MAX_PER_PAGE = 500;
const { PAID, CONFIRMED } = InvoiceStatus;
const PARAMETERS = {
  filter: {
    invoiceTypes: [PAID, CONFIRMED],
  },
  pagination: {
    page: 1,
    perPage: MAX_PER_PAGE,
  },
};

const InvoiceListSelection = props => {
  const { onSelectInvoice } = props;
  const { companyInfo } = useGetAccountHolder();
  const isSubjectToVat = companyInfo && companyInfo.isSubjectToVat;

  const { data, isLoading } = useGetList('invoices', PARAMETERS);

  const listContext = useList({ data, isLoading });
  const handleRowClick = (_id, _resource, record) => onSelectInvoice(record);

  return (
    <ListContextProvider value={listContext} resource='invoices' hasCreate={false} hasEdit={false} hasShow={false} exporter={false} pagination={false}>
      {isLoading ? (
        <Typography>Chargement ...</Typography>
      ) : (
        <Datagrid bulkActionButtons={false} rowClick={handleRowClick}>
          <TextField source='ref' label='Référence' />
          <TextField source='title' label='Titre' />
          <TextField source='customer.name' label='Client' />
          {isSubjectToVat && <TextField source='totalPriceWithVat' label='Prix total (TTC)' />}
          {!isSubjectToVat && <TextField source='totalPriceWithoutVat' label='Prix total (HT)' />}
        </Datagrid>
      )}
    </ListContextProvider>
  );
};

export default InvoiceListSelection;
