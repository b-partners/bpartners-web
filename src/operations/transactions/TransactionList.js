import { Box, IconButton, Tooltip } from '@material-ui/core';
import { Attachment as AttachmentIcon } from '@material-ui/icons';

import { Card, CardContent, Chip, Typography } from '@mui/material';
import { useState } from 'react';

import { BooleanInput, Datagrid, FunctionField, List, SelectInput, TextField, useListContext } from 'react-admin';
import { Document as Pdf, Page as PdfPage } from 'react-pdf/dist/esm/entry.webpack';
import { formatDate } from '../utils/date';
import { EmptyList } from '../utils/EmptyList';
import ListComponent from '../utils/ListComponent';
import { coloredMoney, Currency, normalizeAmount } from '../utils/money';

import PrevNextPagination from '../utils/PrevNextPagination';
import samplePdf from './testInvoice.pdf';

import TransactionChart from './TransactionChart';

//TODO: should be elsewhere
const statuses = {
  PENDING: { label: 'En attente', color: 'orange' },
  DONE: { label: 'Effectué', color: 'green' },
};

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

const StatusField = ({ status }) => <Chip style={{ backgroundColor: statuses[status]['color'], color: 'white' }} label={statuses[status]['label']} />;

const TransactionList = props => {
  const [documentState, setDocumentState] = useState({ documentId: null, shouldShowDocument: false });

  const onDocumentIconClicked = documentId => {
    setDocumentState(e => ({ shouldShowDocument: true, documentId }));
  };

  return (
    <>
      <TransactionChart />
      <Card sx={{ marginTop: 1 }}>
        <CardContent>
          <List
            {...props}
            resource='transactions'
            pagination={<PrevNextPagination /> /*TODO: test that it appears when resourcesCount == 12 */}
            actions={null}
            filters={[
              <SelectInput label='Statut' source='status' choices={[{ id: 'DONE', name: 'Effectué' /*TODO: generate from statuses*/ }]} alwaysOn resettable />,
              <BooleanInput label='Non catégorisées' source='categorized' alwaysOn />,
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

  return (
    !isLoading && (
      <Datagrid bulkActionButtons={false} empty={<EmptyList />}>
        <TextField source='reference' label='Référence' />
        <FunctionField render={record => coloredMoney(normalizeAmount(record.amount), Currency.EUR)} label='Montant' />
        <TextField source='label' label='Titre' />
        <FunctionField
          render={({ category }) =>
            category != null ? (
              <Box sx={{ width: '15vw' }}>
                {category.map(cat => (
                  <Chip label={cat.type} variant='outlined' />
                ))}
              </Box>
            ) : null
          }
          label='Catégorie'
        />
        {/*TODO: allow inline edition*/}
        <FunctionField render={_record => <StatusField status='DONE' /*TODO: take from record*/ />} label='Statut' />
        <FunctionField render={record => formatDate(new Date(record.paymentDatetime))} label='Date de paiement' />
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
    )
  );
};

export default TransactionList;
