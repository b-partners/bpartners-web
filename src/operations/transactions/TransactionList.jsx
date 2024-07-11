import { Attachment as AttachmentIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

import { Button, Card, CardContent, Chip } from '@mui/material';
import { useState } from 'react';

import { BooleanInput, Datagrid, FunctionField, List, SelectInput, TextField, TextInput, useListContext } from 'react-admin';
import { EmptyList } from '../../common/components/EmptyList';
import ListComponent from '../../common/components/ListComponent';
import { coloredPrettyPrintMinors, formatDatetime } from '../../common/utils';

import { ModalProvider } from 'src/common/store/transaction';
import Pagination, { pageSize } from '../../common/components/Pagination';
import { TRANSACTION_STATUSES } from '../../constants';
import ExportLinkMailModal from './components/ExportLinkMailModal';
import GenerateLinkModal from './components/GenerateLinkModal';
import TransactionCategorySelection from './TransactionCategorySelection';
import TransactionChart from './TransactionChart';
import TransactionLinkInvoice from './TransactionLinkInvoice';
import TransactionReceiptView from './TransactionReceiptView';

const StatusField = ({ status }) => (
  <Chip style={{ backgroundColor: TRANSACTION_STATUSES[status]['color'], color: 'white' }} label={TRANSACTION_STATUSES[status]['label']} />
);

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
  return documentState.shouldShowDocument ? (
    <TransactionReceiptView selectedDoc={documentState.document} onClose={closeDocument} />
  ) : (
    <ModalProvider>
      <TransactionChart />
      <Card sx={{ marginTop: 1, border: 0 }}>
        <CardContent>
          <Button
            onClick={handleGenerateLinkModal}
            style={{
              position: 'absolute',
              right: '24px',
              zIndex: 1,
            }}
          >
            Export comptable
          </Button>
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
      {isOpenModal && (
        <GenerateLinkModal isOpenModal={isOpenModal} handleGenerateLinkModal={handleGenerateLinkModal} handleExportLinkMailModal={handleExportLinkMailModal} />
      )}
      {isExportLinkMailModalOpen && <ExportLinkMailModal isOpenModal={isExportLinkMailModalOpen} handleExportLinkMailModal={handleExportLinkMailModal} />}
    </ModalProvider>
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
          render={transaction => {
            return (
              <Tooltip title='Voir mon justificatif'>
                <span>
                  {/* Do NOT remove span otherwise Tooltip won't show while IconButton is disabled
              https://mui.com/material-ui/react-tooltip/#disabled-elements */}
                  <IconButton
                    id={`document-button-${transaction.id}`}
                    disabled={transaction.invoice === null && transaction.supportingDocs.length === 0}
                    onClick={() => onDocumentIconClicked(transaction.invoice, transaction.supportingDocs)}
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
    )
  );
};

export default TransactionList;
