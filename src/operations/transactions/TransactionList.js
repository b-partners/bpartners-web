import { IconButton, Tooltip } from '@mui/material';
import AttachmentIcon from '@mui/icons-material/Attachment';

import { Card, CardContent, Chip, Typography } from '@mui/material';
import { useState } from 'react';

import { BooleanInput, Datagrid, FunctionField, List, SelectInput, TextField, useListContext } from 'react-admin';
import { Document as Pdf, Page as PdfPage } from 'react-pdf/dist/esm/entry.webpack';
import { formatDatetime } from '../utils/date';
import { EmptyList } from '../utils/EmptyList';
import ListComponent from '../utils/ListComponent';
import { coloredPrettyPrintMinors } from '../utils/money';

// import Pagination from '../utils/Pagination';
import samplePdf from './testInvoice.pdf';

import TransactionChart from './TransactionChart';
import { TRANSACTION_STATUSES, TRANSACTION_STATUSES_HANDLED } from '../../constants/transaction-status';
import TransactionCategorySelection from './TransactionCategorySelection';
import Pagination, { pageSize } from '../utils/Pagination';

const Document = ({ transactionRef }) => (
  <Card sx={{ marginLeft: 2, marginTop: 2, minWidth: 500 }}>
    <CardContent>
      <Typography variant='h4'>Justificatif</Typography>
      <Typography variant='h6'>{transactionRef}</Typography>
      <Pdf file={samplePdf /*TODO: retrieve from FilesAPI*/}>
        <PdfPage pageNumber={1} />
      </Pdf>
    </CardContent>
  </Card>
);

const StatusField = ({ status }) => (
  <Chip style={{ backgroundColor: TRANSACTION_STATUSES[status]['color'], color: 'white' }} label={TRANSACTION_STATUSES[status]['label']} />
);

const TransactionList = props => {
  const [documentState, setDocumentState] = useState({ documentId: null, shouldShowDocument: false });

  const onDocumentIconClicked = documentId => {
    setDocumentState({ shouldShowDocument: true, documentId });
  };

  return (
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
            filters={[
              <SelectInput key='transaction_list_select_filter' label='Statut' source='status' choices={TRANSACTION_STATUSES_HANDLED} alwaysOn resettable />,
              <BooleanInput key='transaction_list_boolean_filter' label='Non catégorisées' source='categorized' alwaysOn />,
            ]}
            hasCreate={false}
            hasEdit={false}
            component={ListComponent}
            hasList={false}
            hasShow={false}
            aside={documentState.shouldShowDocument ? <Document transactionRef={documentState.documentId} /> : null}
          >
            <TransactionGrid onDocumentIconClicked={onDocumentIconClicked} />
          </List>
        </CardContent>
      </Card>
    </>
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
          render={({ id }) => (
            <Tooltip title='Vous pourrez bientôt ajouter des justificatifs' onClick={() => onDocumentIconClicked(id)}>
              <span>
                {/* Do NOT remove span otherwise Tooltip won't show while IconButton is disabled
                    https://mui.com/material-ui/react-tooltip/#disabled-elements */}
                <IconButton id={`document-button-${id}`} disabled={true}>
                  <AttachmentIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        />
      </Datagrid>
    )
  );
};

export default TransactionList;
