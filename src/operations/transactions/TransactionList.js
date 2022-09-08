import { useState } from 'react';

import { Datagrid, List, TextField, FunctionField, SelectInput, BooleanInput } from 'react-admin';
import { Currency, prettyPrintMoney } from '../utils/money';

import { red, green } from '@mui/material/colors';
import { Chip, Card, CardContent, Typography } from '@mui/material';
import { Document as Pdf, Page as PdfPage } from 'react-pdf/dist/esm/entry.webpack';
import samplePdf from './testInvoice.pdf';
import { Attachment as AttachmentIcon, Edit as EditIcon } from '@material-ui/icons';
import { IconButton, Tooltip } from '@material-ui/core';

import PrevNextPagination from '../utils/PrevNextPagination';
import { pageSize } from '../utils/PrevNextPagination';
import { useListContext } from 'react-admin';

const coloredMoney = (amount, currency) => (
  //TODO: move to utils/money
  <b style={{ color: amount < 0 ? red[500] : green[500] }}>{prettyPrintMoney(amount, currency)}</b>
);

const statuses = {
  PENDING: { label: 'En attente', color: 'orange' },
  DONE: { label: 'Effectué', color: 'green' },
};

const Document = ({ transactionId }) => (
  <Card sx={{ marginLeft: 2, marginTop: 2, minWidth: 500 }}>
    <CardContent>
      <Typography variant='h4'>Justificatif</Typography>
      <Typography variant='h6'>{transactionId /*TODO: use ref insted*/}</Typography>
      <Pdf file={samplePdf /*TODO: retrieve from FilesAPI*/}>
        <PdfPage pageNumber={1} />
      </Pdf>
    </CardContent>
  </Card>
);

const StatusField = ({ status }) => <Chip style={{ backgroundColor: statuses[status]['color'], color: 'white' }} label={statuses[status]['label']} />;
const TransactionList = props => {
  const { data, isLoading } = useListContext();
  const resourcesCount = data ? Object.keys(data).length : 0;
  const shouldPaginate = isLoading || resourcesCount < pageSize;

  const [documentId, setDocumentId] = useState(null);
  const [shouldShowDocument, setShoudShowDocument] = useState(false);
  const resetDocument = () => {
    setDocumentId(null);
    setShoudShowDocument(null);
  };
  const onDocumentIconClicked = transactionId => {
    console.log(transactionId);
    if (shouldShowDocument && transactionId === documentId) {
      // close document if corresponding row was clicked
      resetDocument();
      return;
    }
    setDocumentId(transactionId);
    setShoudShowDocument(true);
  };

  return (
    <List
      {...props}
      resource='transactions'
      pagination={shouldPaginate ? null : <PrevNextPagination /> /*TODO: test that it appears when resourcesCount == 12 */}
      actions={null}
      filters={[
        <SelectInput label='Statut' source='status' choices={[{ id: 'DONE', name: 'Effectué' /*TODO: generate from statuses*/ }]} alwaysOn resettable />,
        <BooleanInput label='Non catégorisées' source='categorized' alwaysOn />,
      ]}
      hasCreate={false}
      hasEdit={false}
      hasList={false}
      hasShow={false}
      aside={shouldShowDocument ? <Document transactionId={documentId} /> : null}
    >
      <Datagrid bulkActionButtons={false}>
        <TextField source='reference' label='Référence' />
        <FunctionField textAlign='right' render={record => coloredMoney(record.amount, Currency.EUR)} label='Montant' />
        <TextField source='label' label='Titre' />
        <FunctionField
          render={({ category }) =>
            category != null ? (
              <div>
                {category.label /*TODO: select from a mui.select when editbutton has been click*/}
                <IconButton>
                  <EditIcon />
                </IconButton>
              </div>
            ) : null
          }
          label='Catégorie'
        />
        {/*TODO: allow inline edition*/}
        <FunctionField render={({ paymentDatetime }) => new Date(paymentDatetime).toLocaleDateString()} label='Date de paiement' />
        <FunctionField render={_record => <StatusField status='DONE' /*TODO: take from record*/ />} label='Statut' />
        <FunctionField
          render={({ id }) => (
            <Tooltip title='Justificatif' onClick={() => onDocumentIconClicked(id)}>
              <IconButton id={`document-button-${id}`}>
                <AttachmentIcon />
              </IconButton>
            </Tooltip>
          )}
        />
      </Datagrid>
    </List>
  );
};

export default TransactionList;
