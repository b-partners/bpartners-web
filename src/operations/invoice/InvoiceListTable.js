import { Add, Attachment, Check, DoneAll, Send } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { Datagrid, FunctionField, List, TextField, useListContext, useNotify, useRefresh } from 'react-admin';
import invoiceProvider from 'src/providers/invoice-provider';
import { v4 as uuid } from 'uuid';
import { InvoiceStatusEN } from '../../constants/invoice-status';
import ListComponent from '../utils/ListComponent';
import PrevNextPagination from '../utils/PrevNextPagination';
import { getInvoiceStatusInFr, invoiceInitialValue, viewScreenState } from './utils';

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

const InvoiceGridTable = props => {
  const { crUpdateInvoice, viewDocument, sendInvoice } = props;
  const { isLoading } = useListContext();

  return (
    !isLoading && (
      <Datagrid rowClick={(id, resourceName, record) => record.status === InvoiceStatusEN.DRAFT && crUpdateInvoice({ ...record })}>
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
              <TooltipButton title='Justificatif' onClick={event => viewDocument(event, data)} icon={<Attachment />} />
              {data.status === InvoiceStatusEN.DRAFT ? (
                <TooltipButton
                  title='Envoyer et transformer en devis'
                  icon={<Send />}
                  onClick={event =>
                    sendInvoice(
                      event,
                      {
                        ...data,
                        status: InvoiceStatusEN.PROPOSAL,
                      },
                      'Devis bien envoyé'
                    )
                  }
                />
              ) : data.status === InvoiceStatusEN.PROPOSAL ? (
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
              ) : (
                <TooltipButton title='Facture déjà confirmée' icon={<DoneAll />} />
              )}
            </Box>
          )}
          label=''
        />
      </Datagrid>
    )
  );
};

const InvoiceListTable = props => {
  const { stateHandling, invoiceType } = props;
  const notify = useNotify();
  const refresh = useRefresh();

  const sendInvoice = (event, data, successMessage) => sendInvoiceTemplate(event, data, notify, refresh, successMessage);
  const crUpdateInvoice = selectedInvoice => stateHandling({ selectedInvoice, viewScreen: viewScreenState.EDITION });
  const viewDocument = (event, selectedInvoice) => {
    event.stopPropagation();
    stateHandling({ selectedInvoice, viewScreen: viewScreenState.PREVIEW });
  };

  return (
    <List
      exporter={false}
      resource='invoices'
      filter={{ invoiceType }}
      component={ListComponent}
      pagination={<PrevNextPagination />}
      actions={
        <TooltipButton
          style={{ marginRight: 33 }}
          title='Créer un nouveau devis'
          onClick={() => crUpdateInvoice({ ...invoiceInitialValue, id: uuid() })}
          icon={<Add />}
        />
      }
    >
      <InvoiceGridTable crUpdateInvoice={crUpdateInvoice} viewDocument={viewDocument} sendInvoice={sendInvoice} />
    </List>
  );
};

export default InvoiceListTable;
