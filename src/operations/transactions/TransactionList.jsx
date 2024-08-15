import { Attachment as AttachmentIcon } from '@mui/icons-material';

import { Button, Card, CardContent, IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';

import { BooleanInput, Datagrid, FunctionField, List, SelectInput, TextField, TextInput } from 'react-admin';
import { EmptyList } from '../../common/components/EmptyList';
import ListComponent from '../../common/components/ListComponent';
import { coloredPrettyPrintMinors, formatDateTime } from '../../common/utils';

import { ModalProvider } from '@/common/store/transaction';
import Pagination, { pageSize } from '../../common/components/Pagination';
import { TRANSACTION_STATUSES } from '../../constants';
import { ExportLinkMailModal, GenerateLinkModal, StatusField, TransactionLinkInvoice } from './components';
import TransactionCategorySelection from './TransactionCategorySelection';
import TransactionChart from './TransactionChart';
import TransactionReceiptView from './TransactionReceiptView';

const TransactionList = props => {
  const [documentState, setDocumentState] = useState({ document: null, shouldShowDocument: false, type: '' });
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isExportLinkMailModalOpen, setIsExportLinkMailModalOpen] = useState(false);

  const onDocumentIconClicked = (invoice, supportingDocs) => {
    if (invoice) {
      setDocumentState({ shouldShowDocument: true, document: invoice, type: 'INVOICE' });
    } else {
      setDocumentState({ shouldShowDocument: true, document: supportingDocs[0], type: 'TRANSACTION_SUPPORTING_DOCS' });
    }
  };

  const closeDocument = () => {
    setDocumentState(e => ({ ...e, shouldShowDocument: false }));
  };

  const handleGenerateLinkModal = () => {
    setIsOpenModal(!isOpenModal);
  };
  const handleExportLinkMailModal = () => {
    setIsExportLinkMailModalOpen(!isExportLinkMailModalOpen);
  };

  const transactionStatusChoices = Object.keys(TRANSACTION_STATUSES)
    .filter(status => status !== 'UNKNOWN')
    .map((status, k) => ({ id: status, name: TRANSACTION_STATUSES[status].label }));

  const handleShowPdf = transaction => event => {
    event.stopPropagation();
    onDocumentIconClicked(transaction.invoice, transaction.supportingDocs);
  };

  return documentState.shouldShowDocument ? (
    <TransactionReceiptView selectedDoc={documentState.document} onClose={closeDocument} />
  ) : (
    <ModalProvider>
      <TransactionChart />
      <Card sx={{ marginTop: 1, border: 0 }}>
        <CardContent>
          <List
            {...props}
            resource='transactions'
            perPage={pageSize}
            pagination={<Pagination />}
            actions={
              <Button sx={{ width: '10rem', marginBottom: 0.5 }} onClick={handleGenerateLinkModal}>
                Export comptable
              </Button>
            }
            filterDefaultValues={{ categorized: true }}
            filters={[
              <TextInput
                sx={{ marginBottom: 0.5 }}
                key='transaction_list_label_filter'
                data-cy='transaction_list_label_filter'
                label='Rechercher par titre'
                source='label'
                alwaysOn
              />,
              <SelectInput
                key='transaction_list_select_filter'
                data-cy='transaction_list_select_filter'
                label='Statut'
                source='status'
                choices={transactionStatusChoices}
                alwaysOn
                resettable
              />,
              <BooleanInput
                key='transaction_list_boolean_filter'
                data-cy='transaction_list_boolean_filter'
                label='Non Catégorisées'
                source='categorized'
                alwaysOn
              />,
            ]}
            component={ListComponent}
          >
            <Datagrid bulkActionButtons={false} empty={<EmptyList />}>
              <FunctionField render={record => coloredPrettyPrintMinors(record.amount, record.type)} label='Montant' />
              <TextField source='label' label='Titre' />
              <FunctionField render={transaction => <TransactionCategorySelection transaction={transaction} />} label='Catégorie' />
              <FunctionField render={record => <StatusField status={record.status} />} label='Statut' />
              <FunctionField render={record => formatDateTime(new Date(record.paymentDatetime))} label='Date de paiement' />
              <FunctionField
                render={transaction => {
                  return (
                    <Tooltip title='Voir mon justificatif'>
                      <span>
                        {/* Do NOT remove span otherwise Tooltip won't show while IconButton is disabled
              https://mui.com/material-ui/react-tooltip/#disabled-elements */}
                        <IconButton
                          id={`document-button-${transaction.id}`}
                          disabled={transaction.invoice === null && transaction.supportingDocs.length === 0}
                          onClick={handleShowPdf(transaction)}
                        >
                          <AttachmentIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  );
                }}
              />
              <FunctionField render={transaction => <TransactionLinkInvoice transaction={transaction} />} label='' />
            </Datagrid>
          </List>
        </CardContent>
      </Card>
      {isOpenModal && (
        <GenerateLinkModal isOpenModal={isOpenModal} handleGenerateLinkModal={handleGenerateLinkModal} handleExportLinkMailModal={handleExportLinkMailModal} />
      )}
      {isExportLinkMailModalOpen && <ExportLinkMailModal isOpenModal={isExportLinkMailModalOpen} handleExportLinkMailModal={handleExportLinkMailModal} />}
    </ModalProvider>
  );
};

export default TransactionList;
