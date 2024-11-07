import ArchiveBulkAction from '@/common/components/ArchiveBulkAction';
import BPListActions from '@/common/components/BPListActions';
import { useInvoiceToolContext } from '@/common/store/invoice';
import { invoiceProvider } from '@/providers/invoice-provider';
import { InvoiceStatus } from '@bpartners/typescript-client';
import { Box } from '@mui/material';
import { useEffect } from 'react';
import { List, useNotify, useRefresh } from 'react-admin';
import { v4 as uuid } from 'uuid';
import ListComponent from '../../common/components/ListComponent';
import Pagination, { pageSize } from '../../common/components/Pagination';
import {
  EmptyInvoiceList,
  InvoiceCreationButton,
  InvoiceGridTable,
  InvoiceRelaunchHistoryModal,
  InvoiceRelaunchHistoryShowModal,
  InvoiceRelaunchModal,
  InvoiceSearchBar,
} from './components';
import FeedbackModal from './components/FeedbackModal';
import InvoiceSumsCards from './components/InvoiceSumsCards';
import { invoiceInitialValue, viewScreenState } from './utils/utils';
import { parseUrlParams } from '@/common/utils';

const LIST_ACTION_STYLE = { display: 'flex' };

const saveInvoice = (event, data, notify, refresh, successMessage, tabIndex, handleSwitchTab) => {
  if (event) {
    event.stopPropagation();
  }
  invoiceProvider
    .saveOrUpdate([data])
    .then(() => {
      notify(successMessage, { type: 'success' });
      handleSwitchTab(null, tabIndex);
      refresh();
    })
    .catch(() => {
      notify('messages.global.error', { type: 'error' });
    });
};

const InvoiceList = props => {
  const notify = useNotify();
  const refresh = useRefresh();
  const { onStateChange, invoiceTypes, actions, emptyAction } = props;
  const {
    setTab,
    setView,
    modal: { isOpen },
  } = useInvoiceToolContext();

  const crupdateInvoice = selectedInvoice => onStateChange({ selectedInvoice, viewScreen: viewScreenState.EDITION });
  const viewPdf = (event, selectedInvoice) => {
    event.stopPropagation();
    onStateChange({ selectedInvoice, viewScreen: viewScreenState.PREVIEW });
  };

  const createInvoice = status => {
    crupdateInvoice({ ...invoiceInitialValue, id: uuid(), status });
    setView('creation');
  };

  const { showCreateQuote } = parseUrlParams();
  useEffect(() => {
    if (showCreateQuote === 'true') {
      crupdateInvoice({ ...invoiceInitialValue, id: uuid(), status: InvoiceStatus.DRAFT });
      setView('creation');
    }
  }, [showCreateQuote]);

  return (
    <>
      <List
        sx={{
          '& .RaBulkActionsToolbar-toolbar': { display: 'none' },
        }}
        exporter={false}
        resource='invoices'
        filter={{ invoiceTypes }}
        component={ListComponent}
        empty={<EmptyInvoiceList actions={emptyAction} createInvoice={createInvoice} />}
        pagination={<Pagination />}
        perPage={pageSize}
        actions={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <InvoiceSearchBar />
            <InvoiceSumsCards />
            <BPListActions
              hasCreate={false}
              hasExport={false}
              buttons={
                <>
                  <ArchiveBulkAction source='title' statusName='archiveStatus' />
                  {actions}
                  <InvoiceCreationButton createInvoice={createInvoice} />
                </>
              }
            />
          </Box>
        }
      >
        <InvoiceGridTable crupdateInvoice={crupdateInvoice} viewPdf={viewPdf} />
      </List>
      {isOpen && (
        <>
          <FeedbackModal />
          <InvoiceRelaunchModal />
          <InvoiceRelaunchHistoryModal />
          <InvoiceRelaunchHistoryShowModal />
        </>
      )}
    </>
  );
};

export default InvoiceList;
