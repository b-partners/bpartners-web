import { Add, Attachment, Check, DoneAll, TurnRight, DriveFileMove } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { Datagrid, FunctionField, List, TextField, useListContext, useNotify, useRefresh } from 'react-admin';
import invoiceProvider from 'src/providers/invoice-provider';
import { v4 as uuid } from 'uuid';
import { InvoiceStatus } from 'bpartners-react-client';

import { prettyPrintMinors } from '../utils/money';
import ListComponent from '../utils/ListComponent';
import Pagination from '../utils/Pagination';
import { formatDate } from '../utils/date';
import TooltipButton from '../utils/TooltipButton';

import InvoiceRelaunchModal from './InvoiceRelaunchModal';
import { getInvoiceStatusInFr, invoiceInitialValue, viewScreenState, draftInvoiceValidator } from './utils';
import useGetAccountHolder from '../utils/useGetAccountHolder';

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
      notify("Une erreur s'est produite", { type: 'error' });
    });
};

const InvoiceGridTable = props => {
  const { createOrUpdateInvoice, viewPdf, convertToProposal, setInvoiceToRelaunch } = props;
  const { isLoading, refetch } = useListContext();
  const notify = useNotify();

  const onConvertToProposal = data => event => {
    event.stopPropagation();
    if (!draftInvoiceValidator(data)) {
      notify('Veuillez vérifier que tous les champs ont été remplis correctement. Notamment chaque produit doit avoir une quantité supérieure à 0', {
        type: 'warning',
      });
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

  const handleInvoicePaid = invoice => {
    invoiceProvider.saveOrUpdate([{ ...invoice, status: InvoiceStatus.PAID }]).then(() => {
      notify(`Facture ${invoice.ref} payée !`);
      refetch();
    });
  };

  const { companyInfo } = useGetAccountHolder();

  return (
    !isLoading && (
      <Datagrid
        bulkActionButtons={false}
        rowClick={(_id, _resourceName, record) => record.status === InvoiceStatus.DRAFT && createOrUpdateInvoice({ ...record })}
      >
        <TextField source='ref' label='Référence' />
        <TextField source='title' label='Titre' />
        <TextField source='customer[name]' label='Client' />
        {companyInfo && companyInfo.isSubjectToVat && (
          <FunctionField render={data => <Typography variant='body2'>{prettyPrintMinors(data.totalPriceWithVat)}</Typography>} label='Prix TTC' />
        )}
        <FunctionField render={data => <Typography variant='body2'>{getInvoiceStatusInFr(data.status)}</Typography>} label='Statut' />
        <FunctionField render={record => formatDate(new Date(record.sendingDate))} label="Date d'émission" />
        <FunctionField
          render={data => (
            <Box sx={LIST_ACTION_STYLE}>
              <TooltipButton title='Justificatif' onClick={event => viewPdf(event, data)} icon={<Attachment />} disabled={data.fileId ? false : true} />
              {data.status === InvoiceStatus.DRAFT && <TooltipButton title='Convertir en devis' icon={<DriveFileMove />} onClick={onConvertToProposal(data)} />}
              {data.status === InvoiceStatus.PROPOSAL && (
                <>
                  <TooltipButton
                    title='Transformer en facture'
                    icon={<Check />}
                    onClick={event =>
                      convertToProposal(
                        event,
                        {
                          ...data,
                          status: InvoiceStatus.CONFIRMED,
                        },
                        'Devis confirmé',
                        2
                      )
                    }
                  />
                  <TooltipButton
                    title='Envoyer ou relancer ce devis'
                    icon={<TurnRight />}
                    onClick={() => setInvoiceToRelaunch(data)}
                    data-test-item={`relaunch-${data.id}`}
                  />
                </>
              )}
              {data.status !== InvoiceStatus.PROPOSAL && data.status !== InvoiceStatus.DRAFT && (
                <>
                  <TooltipButton
                    disabled={data.status === InvoiceStatus.PAID}
                    title='Marquer comme payée'
                    icon={<DoneAll />}
                    onClick={() => handleInvoicePaid(data)}
                    data-test-item={`pay-${data.id}`}
                  />
                  <TooltipButton
                    disabled={data.status === InvoiceStatus.PAID}
                    title='Envoyer ou relancer cette facture'
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
  const { onStateChange, invoiceTypes, handleSwitchTab } = props;

  const sendInvoice = (event, data, successMessage, tabIndex) => saveInvoice(event, data, notify, refresh, successMessage, tabIndex, handleSwitchTab);
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
        filter={{ invoiceTypes }}
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
