import PrevNextPagination from '../utils/PrevNextPagination';
import { getInvoiceStatus, invoiceInitialValue } from './utils';
import { Check, Send, Attachment, Add, DoneAll } from '@material-ui/icons';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { List, Datagrid, TextField, FunctionField, useNotify, useRefresh, useListContext } from 'react-admin';
import invoiceProvider from 'src/providers/invoice-provider';
import ListComponent from '../utils/ListComponent';

const sendInvoiceTemplate = (event, data, notify, refresh, successMessage) => {
  if (event) {
    event.stopPropagation();
  }
  data.status = 'PROPOSAL';
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
  const { crUpdateInvoice, getInvoiceStatus, viewDocument, sendInvoice } = props;
  const { isLoading } = useListContext();

  return (
    !isLoading && (
      <Datagrid rowClick={(id, resourceName, record) => record.status === 'DRAFT' && crUpdateInvoice({ ...record, id: '' })}>
        <TextField source='ref' label='Référence' />
        <TextField source='title' label='Titre' />
        <TextField source='customer[name]' label='Client' />
        <FunctionField render={data => <Typography variant='body2'>{data.totalVat}€</Typography>} label='TVA' />
        <FunctionField render={data => <Typography variant='body2'>{data.totalPriceWithVat}€</Typography>} label='Prix total' />
        <FunctionField render={data => <Typography variant='body2'>{getInvoiceStatus(data.status)}</Typography>} label='Statut' />
        <TextField source='toPayAt' label='Date de payment' />
        <FunctionField
          render={data => <TooltipButton title='Justificatif' onClick={event => viewDocument(event, data)} icon={<Attachment />} />}
          label='Justificatif'
        />
        <FunctionField
          render={data =>
            data.status === 'DRAFT' ? (
              <TooltipButton title='Envoyer et transformer en devis' icon={<Send />} onClick={event => sendInvoice(event, { ...data }, 'Devis bien envoyer')} />
            ) : data.status === 'PROPOSAL' ? (
              <TooltipButton
                title='Transformer en facture'
                icon={<Check />}
                onClick={event => sendInvoice(event, { ...data, status: 'CONFIRMED' }, 'Devis confirmer')}
              />
            ) : (
              <TooltipButton title='Facture déjà confirmé' icon={<DoneAll />} />
            )
          }
          label='Envoie'
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
  const crUpdateInvoice = selectedInvoice => stateHandling({ selectedInvoice, viewScreen: 'edition' });
  const viewDocument = (event, selectedInvoice) => {
    event.stopPropagation();
    stateHandling({ selectedInvoice, viewScreen: 'preview' });
  };

  return (
    <List
      exporter={false}
      resource='invoices'
      filter={{ invoiceType }}
      component={ListComponent}
      pagination={<PrevNextPagination />}
      actions={<TooltipButton style={{ marginRight: 33 }} title='Créer un nouveau devis' onClick={() => crUpdateInvoice(invoiceInitialValue)} icon={<Add />} />}
    >
      <InvoiceGridTable crUpdateInvoice={crUpdateInvoice} getInvoiceStatus={getInvoiceStatus} viewDocument={viewDocument} sendInvoice={sendInvoice} />
    </List>
  );
};

export default InvoiceListTable;
