import { Add, Attachment, Check, DoneAll, Send, TurnRight } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { Datagrid, FunctionField, List, TextField, useListContext, useNotify, useRefresh } from 'react-admin';
import invoiceProvider from 'src/providers/invoice-provider';
import { v4 as uuid } from 'uuid';
import { InvoiceStatusEN } from '../../constants/invoice-status';
import ListComponent from '../utils/ListComponent';
import Pagination from '../utils/Pagination';
import { InvoiceRelaunchModal } from './InvoiceRelaunchModal';
import { getInvoiceStatusInFr, InvoiceInitialValue, ViewScreenState, invoiceValidator, INVOICE_DRAFT_ERROR_MESSAGE } from './utils';

const LIST_ACTION_STYLE = { display: 'flex' };

const sendInvoiceTemplate = (event, data, notify, refresh, successMessage) => {
  if (event) {
    event.stopPropagation();
  }
  invoiceProvider
    .saveOrUpdate([data])
    .then(() => {
      notify(successMessage, { type: 'success' });
      refresh();
    })
    .catch(() => {
      notify("Une erreur s'est produite", { type: 'error' });
    });
};

const TooltipButton = ({ icon, ...others }) => (
  <Tooltip {...others} sx={{ margin: '0 15px' }}>
    <IconButton>{icon}</IconButton>
  </Tooltip>
);

const Invoice = props => {
  const { createOrUpdateInvoice, viewDocument, sendInvoice, setInvoiceToRelaunch } = props;
  const { isLoading } = useListContext();
  const notify = useNotify();

  const onSendDraftInvoice = (event, invoice) => {
    if (!invoiceValidator(invoice)) {
      event.stopPropagation();
      notify(INVOICE_DRAFT_ERROR_MESSAGE, { type: 'warning', autoHideDuration: 3000, multiLine: true });
    } else {
      sendInvoice(
        event,
        {
          ...invoice,
          status: InvoiceStatusEN.PROPOSAL,
        },
        'Devis bien envoyé'
      );
    }
  };

  return (
    !isLoading && (
      <Datagrid rowClick={(_id, _resourceName, record) => record.status === InvoiceStatusEN.DRAFT && createOrUpdateInvoice({ ...record })}>
        <TextField source='ref' label='Référence' />
        <TextField source='title' label='Titre' />
        <TextField source='customer[name]' label='Client' />
        <FunctionField render={data => <Typography variant='body2'>{data.totalVat}€</Typography>} label='TVA' />
        <FunctionField render={data => <Typography variant='body2'>{data.totalPriceWithVat}€</Typography>} label='Prix total' />
        <FunctionField render={data => <Typography variant='body2'>{getInvoiceStatusInFr(data.status)}</Typography>} label='Statut' />
        <TextField source='toPayAt' label='Date de paiement' />
        <FunctionField
          render={data => (
            <Box sx={LIST_ACTION_STYLE}>
              <TooltipButton title='Justificatif' onClick={event => viewDocument(event, data)} icon={<Attachment />} disabled={data.fileId ? false : true} />
              {data.status === InvoiceStatusEN.DRAFT && (
                <TooltipButton title='Envoyer et transformer en devis' icon={<Send />} onClick={event => onSendDraftInvoice(event, data)} />
              )}
              {data.status === InvoiceStatusEN.PROPOSAL && (
                <TooltipButton
                  title='Transformer en facture'
                  icon={<Check />}
                  onClick={event =>
                    sendInvoice(
                      event,
                      {
                        ...data,
                        status: InvoiceStatusEN.CONFIRMED,
                      },
                      'Devis confirmé'
                    )
                  }
                />
              )}
              {data.status === InvoiceStatusEN.CONFIRMED && (
                <>
                  <TooltipButton title='Facture déjà confirmée' icon={<DoneAll />} />
                  <TooltipButton
                    title='Relancer manuellement ce devis'
                    icon={<TurnRight />}
                    onClick={() => setInvoiceToRelaunch(data)}
                    data-test-item={`relaunch-${data.id}`}
                  />
                </>
              )}
            </Box>
          )}
          label=''
        />
      </Datagrid>
    )
  );
};

const InvoiceList = props => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const notify = useNotify();
  const refresh = useRefresh();
  const { onStateChange, invoiceType } = props;

  const sendInvoice = (event, data, successMessage) => sendInvoiceTemplate(event, data, notify, refresh, successMessage);
  const createOrUpdateInvoice = selectedInvoice =>
    onStateChange({
      selectedInvoice,
      viewScreen: ViewScreenState.EDITION,
    });
  const viewPdf = (event, selectedInvoice) => {
    event.stopPropagation();
    onStateChange({ selectedInvoice, viewScreen: ViewScreenState.PREVIEW });
  };

  return (
    <>
      <List
        exporter={false}
        resource='invoices'
        filter={{ invoiceType }}
        component={ListComponent}
        pagination={<Pagination />}
        actions={
          <TooltipButton
            style={{ marginRight: 33 }}
            title='Créer un nouveau devis'
            onClick={() => createOrUpdateInvoice({ ...InvoiceInitialValue, id: uuid() })}
            icon={<Add />}
          />
        }
      >
        <Invoice createOrUpdateInvoice={createOrUpdateInvoice} viewDocument={viewPdf} sendInvoice={sendInvoice} setInvoiceToRelaunch={setSelectedInvoice} />
      </List>

      <InvoiceRelaunchModal invoice={selectedInvoice} resetInvoice={() => setSelectedInvoice(null)} />
    </>
  );
};

export default InvoiceList;
