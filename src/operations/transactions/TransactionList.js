import { Attachment as AttachmentIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

import { Card, CardContent, Chip } from '@mui/material';
import { useState } from 'react';

import { BooleanInput, Datagrid, FunctionField, List, SelectInput, TextField, TextInput, useListContext } from 'react-admin';
import { EmptyList } from '../../common/components/EmptyList';
import ListComponent from '../../common/components/ListComponent';
import { formatDatetime, coloredPrettyPrintMinors } from '../../common/utils';

import Pagination, { pageSize } from '../../common/components/Pagination';
import { TRANSACTION_STATUSES } from '../../constants/transaction-status';
import InvoicePdfDocument from '../invoice/InvoicePdfDocument';
import TransactionCategorySelection from './TransactionCategorySelection';
import TransactionChart from './TransactionChart';
import TransactionLinkInvoice from './TransactionLinkInvoice';

const StatusField = ({ status }) => (
  <Chip style={{ backgroundColor: TRANSACTION_STATUSES[status]['color'], color: 'white' }} label={TRANSACTION_STATUSES[status]['label']} />
);

const TransactionList = props => {
  const [documentState, setDocumentState] = useState({ document: null, shouldShowDocument: false });

  const onDocumentIconClicked = document => {
    setDocumentState({ shouldShowDocument: true, document });
  };
  const closeDocument = () => {
    setDocumentState(e => ({ ...e, shouldShowDocument: false }));
  };

  const transactionStatusChoices = Object.keys(TRANSACTION_STATUSES)
    .filter(status => status !== 'UNKNOWN')
    .map((status, k) => ({ id: status, name: TRANSACTION_STATUSES[status].label }));
  return !documentState.shouldShowDocument ? (
    <>
      <TransactionChart />
      <Card sx={{ marginTop: 1, border: 0 }}>
        <CardContent>
          <List
            {...props}
            resource='transactions'
            perPage={pageSize}
            pagination={<Pagination /> /*TODO: test that it appears when resourcesCount == 12 */}
            actions={null}
            filterDefaultValues={{ categorized: true }}
            filters={[
              <TextInput key='transaction_list_label_filter' label='Rechercher par titre' source='label' alwaysOn />,
              <SelectInput key='transaction_list_select_filter' label='Statut' source='status' choices={transactionStatusChoices} alwaysOn resettable />,
              <BooleanInput key='transaction_list_boolean_filter' label='Non Catégorisées' source='categorized' alwaysOn />,
            ]}
            component={ListComponent}
          >
            <TransactionGrid onDocumentIconClicked={onDocumentIconClicked} />
          </List>
        </CardContent>
      </Card>
    </>
  ) : (
    <InvoicePdfDocument selectedInvoice={documentState.document} onClose={closeDocument} />
  );
};

const TransactionGrid = ({ onDocumentIconClicked }) => {
  const { isLoading } = useListContext();

  // TODO: allow inline edition
  return (
    !isLoading && (
      <Datagrid bulkActionButtons={false} empty={<EmptyList />}>
        <FunctionField render={record => coloredPrettyPrintMinors(record.amount, record.type)} label='Montant' />
        <TextField source='label' label='Titre' />
        <FunctionField render={transaction => <TransactionCategorySelection transaction={transaction} />} label='Catégorie' />
        <FunctionField render={record => <StatusField status={record.status} />} label='Statut' />
        <FunctionField render={record => formatDatetime(new Date(record.paymentDatetime))} label='Date de paiement' />
        <FunctionField
          render={({ id, invoice }) => (
            <Tooltip title='Voir mon justificatifs' onClick={() => onDocumentIconClicked(invoice)}>
              <span>
                {/* Do NOT remove span otherwise Tooltip won't show while IconButton is disabled
                    https://mui.com/material-ui/react-tooltip/#disabled-elements */}
                <IconButton id={`document-button-${id}`} disabled={invoice === null}>
                  <AttachmentIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        />
        <FunctionField render={transaction => <TransactionLinkInvoice transaction={transaction} />} label='' />
      </Datagrid>
    )
  );
};

export default TransactionList;
