import { Add, Attachment, Check, DoneAll, DriveFileMove, TurnRight } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { InvoiceStatus } from 'bpartners-react-client';
import { Datagrid, FunctionField, List, TextField, useListContext, useNotify, useRefresh } from 'react-admin';
import { v4 as uuid } from 'uuid';

import { formatDate, prettyPrintMoney } from '../../common/utils';
import ListComponent from '../../common/components/ListComponent';
import Pagination, { pageSize } from '../../common/components/Pagination';
import TooltipButton from '../../common/components/TooltipButton';

import PopoverButton from '../../common/components/PopoverButton';
import useGetAccountHolder from '../../common/hooks/use-get-account-holder';
import InvoiceRelaunchModal from './InvoiceRelaunchModal';
import { getInvoiceStatusInFr, invoiceInitialValue, viewScreenState } from './utils/utils';
import { invoiceProvider } from 'src/providers/invoice-provider';
import { RaMoneyField } from 'src/common/components';
import BPListActions from 'src/common/components/BPListActions';
import ArchiveBulkAction from 'src/common/components/ArchiveBulkAction';
import FeedbackModal from './components/FeedbackModal';
import { ConversionContext, useInvoiceToolContext } from 'src/common/store/invoice';
import { InvoiceButtonConversion } from './components/InvoiceButtonConversion';

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

const InvoiceGridTable = props => {
  const { crupdateInvoice, viewPdf: setPdf } = props;
  const { isLoading } = useListContext();
  const { openModal, setView } = useInvoiceToolContext();

  const { companyInfo } = useGetAccountHolder();

  const nameRenderer = ({ customer }) => <Typography>{`${customer?.lastName} ${customer?.firstName}`}</Typography>;

  const editInvoice = (_id, _resourceName, record) => {
    if (record.status === InvoiceStatus.DRAFT) {
      crupdateInvoice({ ...record });
      setView('edition');
    }
  };

  const viewPdf = (event, data) => {
    setPdf(event, data);
    setView('preview');
  };

  return (
    !isLoading && (
      <Datagrid rowClick={editInvoice}>
        <TextField source='ref' label='Référence' />
        <TextField source='title' label='Titre' />
        <FunctionField render={nameRenderer} label='Client' />
        <RaMoneyField
          render={data => (companyInfo && companyInfo.isSubjectToVat ? data.totalPriceWithVat : data.totalPriceWithoutVat)}
          label='Prix TTC'
          variant='body2'
        />
        <FunctionField render={data => <Typography variant='body2'>{getInvoiceStatusInFr(data.status)}</Typography>} label='Statut' />
        <FunctionField render={record => formatDate(new Date(record.sendingDate))} label="Date d'émission" />
        <FunctionField
          render={data => (
            <ConversionContext.Provider value={{ invoice: data }}>
              <Box sx={LIST_ACTION_STYLE}>
                <TooltipButton title='Justificatif' onClick={event => viewPdf(event, data)} icon={<Attachment />} disabled={data.fileId ? false : true} />
                {data.status === InvoiceStatus.DRAFT && <InvoiceButtonConversion icon={<DriveFileMove />} to='PROPOSAL' />}
                {data.status === InvoiceStatus.PROPOSAL && (
                  <>
                    <InvoiceButtonConversion icon={<Check />} to='CONFIRMED' />
                    <TooltipButton
                      title='Envoyer ou relancer ce devis'
                      icon={<TurnRight />}
                      onClick={() => openModal({ invoice: data, isOpen: true, type: 'RELAUNCH' })}
                      data-testid={`relaunch-${data.id}`}
                    />
                  </>
                )}
                {data.status !== InvoiceStatus.PROPOSAL && data.status !== InvoiceStatus.DRAFT && (
                  <>
                    <InvoiceButtonConversion icon={<DoneAll />} to='PAID' disabled={data.status === InvoiceStatus.PAID} />
                    <TooltipButton
                      disabled={data.status === InvoiceStatus.PAID}
                      title='Envoyer ou relancer cette facture'
                      icon={<TurnRight />}
                      onClick={() => openModal({ invoice: data, isOpen: true, type: 'RELAUNCH' })}
                      data-testid={`relaunch-${data.id}`}
                    />
                  </>
                )}
              </Box>
            </ConversionContext.Provider>
          )}
          label=''
        />
      </Datagrid>
    )
  );
};

const InvoiceList = props => {
  const notify = useNotify();
  const refresh = useRefresh();
  const { onStateChange, invoiceTypes } = props;
  const { setTab, setView } = useInvoiceToolContext();

  const sendInvoice = (event, data, successMessage, tabIndex) => saveInvoice(event, data, notify, refresh, successMessage, tabIndex, setTab);
  const crupdateInvoice = selectedInvoice => onStateChange({ selectedInvoice, viewScreen: viewScreenState.EDITION });
  const viewPdf = (event, selectedInvoice) => {
    event.stopPropagation();
    onStateChange({ selectedInvoice, viewScreen: viewScreenState.PREVIEW });
  };

  const createInvoice = status => {
    crupdateInvoice({ ...invoiceInitialValue, id: uuid(), status });
    setView('creation');
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
        actions={
          <BPListActions
            hasCreate={false}
            hasExport={false}
            buttons={
              <>
                <ArchiveBulkAction source='title' statusName='archiveStatus' />
                <PopoverButton style={{ marginRight: 5.2 }} icon={<Add />} label='Créer un nouveau devis'>
                  <Box sx={{ width: '13rem', padding: 0.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button name='create-draft-invoice' onClick={() => createInvoice(InvoiceStatus.DRAFT)} sx={{ margin: 1, display: 'block', width: '12rem' }}>
                      Créer un devis
                    </Button>
                    <Button
                      name='create-confirmed-invoice'
                      onClick={() => createInvoice(InvoiceStatus.CONFIRMED)}
                      sx={{ margin: 1, display: 'block', width: '12rem' }}
                    >
                      Créer une facture
                    </Button>
                  </Box>
                </PopoverButton>
              </>
            }
          />
        }
      >
        <InvoiceGridTable crupdateInvoice={crupdateInvoice} viewPdf={viewPdf} convertToProposal={sendInvoice} />
      </List>

      <FeedbackModal />
      <InvoiceRelaunchModal />
    </>
  );
};

export default InvoiceList;
