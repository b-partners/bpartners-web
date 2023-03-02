import { Add, Attachment, Check, DoneAll, DriveFileMove, TurnRight } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { InvoiceStatus } from 'bpartners-react-client';
import { useState } from 'react';
import { Datagrid, FunctionField, List, TextField, useListContext, useNotify, useRefresh } from 'react-admin';
import invoiceProvider from 'src/providers/invoice-provider';
import { v4 as uuid } from 'uuid';

import { formatDate } from '../../common/utils/date';
import ListComponent from '../../common/components/ListComponent';
import { prettyPrintMinors } from '../../common/utils/money';
import Pagination, { pageSize } from '../../common/components/Pagination';
import TooltipButton from '../../common/components/TooltipButton';

import PopoverButton from '../../common/components/PopoverButton';
import useGetAccountHolder from '../../common/hooks/use-get-account-holder';
import InvoiceRelaunchModal from './InvoiceRelaunchModal';
import { draftInvoiceValidator, getInvoiceStatusInFr, InvoiceFieldErrorMessage, invoiceInitialValue, viewScreenState } from './utils';

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

  const handleInvoicePaid = invoice => {
    invoiceProvider.saveOrUpdate([{ ...invoice, status: InvoiceStatus.PAID }]).then(() => {
      notify(`Facture ${invoice.ref} payée !`);
      refetch();
    });
  };

  const { companyInfo } = useGetAccountHolder();

  const nameRenderer = ({ customer }) => <Typography>{`${customer?.lastName || ''} ${customer?.firstName}` || ''}</Typography>;

  return (
    !isLoading && (
      <Datagrid
        bulkActionButtons={false}
        rowClick={(_id, _resourceName, record) => record.status === InvoiceStatus.DRAFT && createOrUpdateInvoice({ ...record })}
      >
        <TextField source='ref' label='Référence' />
        <TextField source='title' label='Titre' />
        <FunctionField render={nameRenderer} label='Client' />
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

const InvoiceList = props => {
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
        pagination={<Pagination filter={{ invoiceTypes }} name={invoiceTypes[0]} />}
        perPage={pageSize}
        actions={
          <PopoverButton style={{ marginRight: 5.2 }} icon={<Add />} label='Créer un nouveau devis'>
            <Box sx={{ width: '13rem', padding: 0.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                name='create-draft-invoice'
                onClick={() => createOrUpdateInvoice({ ...invoiceInitialValue, id: uuid() })}
                sx={{ margin: 1, display: 'block', width: '12rem' }}
              >
                Créer un devis
              </Button>
              <Button
                name='create-confirmed-invoice'
                onClick={() => createOrUpdateInvoice({ ...invoiceInitialValue, id: uuid(), status: InvoiceStatus.CONFIRMED })}
                sx={{ margin: 1, display: 'block', width: '12rem' }}
              >
                Créer une facture
              </Button>
            </Box>
          </PopoverButton>
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

export default InvoiceList;
