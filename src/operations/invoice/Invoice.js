import { Add, Attachment, Check, DoneAll, TurnRight, DriveFileMove } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { Datagrid, FunctionField, List, TextField, useListContext, useNotify, useRefresh } from 'react-admin';
import invoiceProvider from 'src/providers/invoice-provider';
import { v4 as uuid } from 'uuid';
import { InvoiceStatusEN } from '../../constants/invoice-status';

import { prettyPrintMinors } from '../utils/money';
import ListComponent from '../utils/ListComponent';
import Pagination from '../utils/Pagination';
import { formatDate } from '../utils/date';

import InvoiceRelaunchModal from './InvoiceRelaunchModal';
import { getInvoiceStatusInFr, invoiceInitialValue, viewScreenState } from './utils';

const LIST_ACTION_STYLE = { display: 'flex' };

const saveInvoice = (event, data, notify, refresh, successMessage) => {
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
  const { createOrUpdateInvoice, viewPdf, convertToProposal, setInvoiceToRelaunch } = props;
  const { isLoading } = useListContext();

  return (
    !isLoading && (
      <Datagrid rowClick={(_id, _resourceName, record) => record.status === InvoiceStatusEN.DRAFT && createOrUpdateInvoice({ ...record })}>
        <TextField source='ref' label='Référence' />
        <TextField source='title' label='Titre' />
        <TextField source='customer[name]' label='Client' />
        <FunctionField render={data => <Typography variant='body2'>{prettyPrintMinors(data.totalPriceWithVat)}</Typography>} label='Prix TTC' />
        <FunctionField render={data => <Typography variant='body2'>{getInvoiceStatusInFr(data.status)}</Typography>} label='Statut' />
        <FunctionField render={record => formatDate(new Date(record.toPayAt))} label='Date de paiement' />
        <FunctionField
          render={data => (
            <Box sx={LIST_ACTION_STYLE}>
              <TooltipButton title='Justificatif' onClick={event => viewPdf(event, data)} icon={<Attachment />} disabled={data.fileId ? false : true} />
              {data.status === InvoiceStatusEN.DRAFT && (
                <TooltipButton
                  title='Convertir en devis'
                  icon={<DriveFileMove />}
                  onClick={event =>
                    convertToProposal(
                      event,
                      {
                        ...data,
                        status: InvoiceStatusEN.PROPOSAL,
                      },
                      'Devis bien envoyé'
                    )
                  }
                />
              )}
              {data.status === InvoiceStatusEN.PROPOSAL && (
                <>
                  <TooltipButton
                    title='Transformer en facture'
                    icon={<Check />}
                    onClick={event =>
                      convertToProposal(
                        event,
                        {
                          ...data,
                          status: InvoiceStatusEN.CONFIRMED,
                        },
                        'Devis confirmé'
                      )
                    }
                  />
                  <TooltipButton
                    title='Relancer manuellement ce devis'
                    icon={<TurnRight />}
                    onClick={() => setInvoiceToRelaunch(data)}
                    data-test-item={`relaunch-${data.id}`}
                  />
                </>
              )}
              {data.status !== InvoiceStatusEN.PROPOSAL && data.status !== InvoiceStatusEN.DRAFT && (
                <>
                  <TooltipButton title='Facture déjà confirmée' icon={<DoneAll />} />
                  <TooltipButton
                    title='Relancer manuellement cette facture'
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

const Invoice = props => {
  const [invoiceToRelaunch, setInvoiceToRelaunch] = useState(null);
  const notify = useNotify();
  const refresh = useRefresh();
  const { onStateChange, invoiceType } = props;

  const sendInvoice = (event, data, successMessage) => saveInvoice(event, data, notify, refresh, successMessage);
  const createOrUpdateInvoice = selectedInvoice => onStateChange({ selectedInvoice, viewScreen: viewScreenState.EDITION });
  const viewPdf = (event, selectedInvoice) => {
    event.stopPropagation();
    onStateChange({ selectedInvoice, viewScreen: viewScreenState.PREVIEW });
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
            onClick={() => createOrUpdateInvoice({ ...invoiceInitialValue, id: uuid() })}
            icon={<Add />}
          />
        }
      >
        <InvoiceGridTable
          createOrUpdateInvoice={createOrUpdateInvoice}
          viewPdf={viewPdf}
          convertToProposal={sendInvoice}
          setInvoiceToRelaunch={setInvoiceToRelaunch}
        />
      </List>

      <InvoiceRelaunchModal invoice={invoiceToRelaunch} resetInvoice={() => setInvoiceToRelaunch(null)} />
    </>
  );
};

export default Invoice;
