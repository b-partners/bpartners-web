import { Typography } from '@mui/material';
import { InvoiceStatus } from 'bpartners-react-client';
import { Datagrid, FunctionField, List, TextField, useListContext } from 'react-admin';

import { formatDate } from '../../common/utils';
import ListComponent from '../../common/components/ListComponent';
import Pagination, { pageSize } from '../../common/components/Pagination';
import useGetAccountHolder from '../../common/hooks/use-get-account-holder';
import InvoiceRelaunchModal from './InvoiceRelaunchModal';
import { getInvoiceStatusInFr } from './utils/utils';
import { RaMoneyField } from 'src/common/components';
import BPListActions from 'src/common/components/BPListActions';
import FeedbackModal from './components/FeedbackModal';
import { InvoiceActionButtons } from './components';
import { InvoiceListActionButtons } from './components/InvoiceListActionButtons';
import { useInvoiceContext } from 'src/common/hooks';
import { InvoiceModalContextProvider } from './components/InvoiceModalContext';

const InvoiceGridTable = () => {
  const { isLoading } = useListContext();
  const { editInvoice } = useInvoiceContext();
  const { companyInfo } = useGetAccountHolder();

  const nameRenderer = ({ customer }) => <Typography>{`${customer?.lastName || ''} ${customer?.firstName}` || ''}</Typography>;

  return (
    !isLoading && (
      <Datagrid rowClick={(_id, _resourceName, record) => record.status === InvoiceStatus.DRAFT && editInvoice(record)}>
        <TextField source='ref' label='Référence' />
        <TextField source='title' label='Titre' />
        <FunctionField render={nameRenderer} label='Client' />
        {companyInfo && companyInfo.isSubjectToVat && <RaMoneyField render={data => data.totalPriceWithVat} label='Prix TTC' variant='body2' />}
        <FunctionField render={data => <Typography variant='body2'>{getInvoiceStatusInFr(data.status)}</Typography>} label='Statut' />
        <FunctionField render={record => formatDate(new Date(record.sendingDate))} label="Date d'émission" />
        <FunctionField render={data => <InvoiceListActionButtons invoice={data} />} label='' />
      </Datagrid>
    )
  );
};

const InvoiceList = props => {
  const { invoiceTypes } = props;

  return (
    <InvoiceModalContextProvider>
      <List
        sx={{
          '& .RaBulkActionsToolbar-toolbar': { display: 'none' },
        }}
        exporter={false}
        resource='invoices'
        filter={{ invoiceTypes }}
        component={ListComponent}
        pagination={<Pagination filter={{ invoiceTypes }} name={invoiceTypes[0]} />}
        perPage={pageSize}
        actions={<BPListActions hasCreate={false} hasExport={false} buttons={<InvoiceActionButtons />} />}
      >
        <InvoiceGridTable />
      </List>

      <FeedbackModal />
      <InvoiceRelaunchModal />
    </InvoiceModalContextProvider>
  );
};

export default InvoiceList;
