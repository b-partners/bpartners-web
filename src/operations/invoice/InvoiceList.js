import { Attachment, Check, DoneAll, DriveFileMove, TurnRight } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { InvoiceStatus } from 'bpartners-react-client';
import { useState } from 'react';
import { Datagrid, FunctionField, List, TextField, useListContext, useNotify, useRefresh } from 'react-admin';

import { formatDate } from '../../common/utils';
import ListComponent from '../../common/components/ListComponent';
import Pagination, { pageSize } from '../../common/components/Pagination';
import TooltipButton from '../../common/components/TooltipButton';
import useGetAccountHolder from '../../common/hooks/use-get-account-holder';
import InvoiceRelaunchModal from './InvoiceRelaunchModal';
import { draftInvoiceValidator, EInvoiceModalType, getInvoiceStatusInFr, InvoiceFieldErrorMessage, viewScreenState } from './utils/utils';
import { printError } from 'src/common/utils';
import { invoiceProvider } from 'src/providers/invoice-provider';
import { RaMoneyField } from 'src/common/components';
import BPListActions from 'src/common/components/BPListActions';
import FeedbackModal from './components/FeedbackModal';
import { InvoiceActionButtons } from './components';


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

const InvoiceGridTable = props => {
  const { crupdateInvoice, viewPdf, convertToProposal, setInvoice } = props;
  const { isLoading, refetch } = useListContext();
  const notify = useNotify();

  const onConvertToProposal = data => event => {
    event.stopPropagation();
    if (!draftInvoiceValidator(data)) {
      notify(InvoiceFieldErrorMessage, { type: 'warning' });
    } else {
      convertToProposal(
        event,
        {
          ...data,
          status: InvoiceStatus.PROPOSAL,
        },
        'Brouillon transformé en devis !',
        1
      );
    }
  };

  const setInvoiceToRelaunch = data => setInvoice({ selectedInvoice: data, modalFor: EInvoiceModalType.RELAUNCH });
  const setInvoiceToFeedback = data => setInvoice({ selectedInvoice: data, modalFor: EInvoiceModalType.FEEDBACK });

  const handleInvoicePaid = invoice => {
    invoiceProvider.saveOrUpdate([{ ...invoice, status: InvoiceStatus.PAID }]).then(() => {
      notify(`Facture ${invoice.ref} payée !`);
      setInvoiceToFeedback(invoice);
      refetch().catch(printError);
    });
  };

  const { companyInfo } = useGetAccountHolder();

  const nameRenderer = ({ customer }) => <Typography>{`${customer?.lastName || ''} ${customer?.firstName}` || ''}</Typography>;

  return (
    !isLoading && (
      <Datagrid rowClick={(_id, _resourceName, record) => record.status === InvoiceStatus.DRAFT && crupdateInvoice({ ...record })}>
        <TextField source='ref' label='Référence' />
        <TextField source='title' label='Titre' />
        <FunctionField render={nameRenderer} label='Client' />
        {companyInfo && companyInfo.isSubjectToVat && <RaMoneyField render={data => data.totalPriceWithVat} label='Prix TTC' variant='body2' />}
        <FunctionField render={data => <Typography variant='body2'>{getInvoiceStatusInFr(data.status)}</Typography>} label='Statut' />
        <FunctionField render={record => formatDate(new Date(record.sendingDate))} label="Date d'émission" />
        <FunctionField
          render={data => (

          )}
          label=''
        />
      </Datagrid>
    )
  );
};

const InvoiceList = props => {
  const [{ selectedInvoice, modalFor }, setInvoice] = useState({ selectedInvoice: null, modalFor: null });
  const notify = useNotify();
  const refresh = useRefresh();
  const { onStateChange, invoiceTypes, handleSwitchTab } = props;

  const handleResetInvoice = () => setInvoice({ modalFor: null, selectedInvoice: null });

  const sendInvoice = (event, data, successMessage, tabIndex) => saveInvoice(event, data, notify, refresh, successMessage, tabIndex, handleSwitchTab);
  const crupdateInvoice = selectedInvoice => onStateChange({ selectedInvoice, viewScreen: viewScreenState.EDITION });
  const viewPdf = (event, selectedInvoice) => {
    event.stopPropagation();
    onStateChange({ selectedInvoice, viewScreen: viewScreenState.PREVIEW });
  };

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
        pagination={<Pagination filter={{ invoiceTypes }} name={invoiceTypes[0]} />}
        perPage={pageSize}
        actions={<BPListActions hasCreate={false} hasExport={false} buttons={<InvoiceActionButtons />} />}
      >
        <InvoiceGridTable crupdateInvoice={crupdateInvoice} viewPdf={viewPdf} convertToProposal={sendInvoice} setInvoice={setInvoice} />
      </List>

      <FeedbackModal invoice={modalFor === EInvoiceModalType.FEEDBACK ? selectedInvoice : null} resetInvoice={handleResetInvoice} />
      <InvoiceRelaunchModal invoice={modalFor === EInvoiceModalType.RELAUNCH ? selectedInvoice : null} resetInvoice={handleResetInvoice} />
    </>
  );
};

export default InvoiceList;
