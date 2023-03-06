import { Box, Card, CardContent, CardHeader, Tab, Tabs } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { InvoiceStatus } from 'bpartners-react-client';
import { useReducer } from 'react';
import TabPanel from '../../common/components/TabPanel';
import InvoiceForm from './InvoiceForm';
import InvoiceList from './InvoiceList';
import InvoicePdfDocument, { CancelButton } from './InvoicePdfDocument';
import { InvoiceActionType, invoiceListInitialState, viewScreenState } from './utils';

const useStyle = makeStyles(() => ({
  card: { border: 'none' },
  form: { transform: 'translateY(-1rem)' },
}));

const TAB_PANEL_STYLE = { padding: 0 };

const invoiceListReducer = (state, { type, payload }) => {
  switch (type) {
    case InvoiceActionType.START_PENDING:
      return { ...state, nbPendingInvoiceCrupdate: state.nbPendingInvoiceCrupdate + 1, documentUrl: payload.documentUrl };
    case InvoiceActionType.STOP_PENDING:
      return { ...state, nbPendingInvoiceCrupdate: state.nbPendingInvoiceCrupdate - 1, documentUrl: payload.documentUrl };
    case InvoiceActionType.SET:
      return { ...state, ...payload };
    default:
      throw new Error('Unknown action type');
  }
};

const InvoiceListEditor = () => {
  const classes = useStyle();
  const [{ selectedInvoice, tabIndex, nbPendingInvoiceCrupdate, viewScreen, documentUrl }, dispatch] = useReducer(invoiceListReducer, invoiceListInitialState);

  const stateChangeHandling = values => dispatch({ type: InvoiceActionType.SET, payload: values });
  const handlePending = (type, documentUrl) => dispatch({ type, payload: { documentUrl } });

  const handleSwitchTab = (_e, newTabIndex) => stateChangeHandling({ tabIndex: newTabIndex });

  const returnToList = invoice => {
    const newTabIndex = invoice && invoice.status === InvoiceStatus.CONFIRMED ? 2 : tabIndex;
    stateChangeHandling({ viewScreen: viewScreenState.LIST, tabIndex: newTabIndex });
  };

  return (
    <Box>
      {viewScreen === viewScreenState.LIST ? (
        <Box>
          <Tabs value={tabIndex} onChange={handleSwitchTab} variant='fullWidth'>
            <Tab label='Brouillons' />
            <Tab label='Devis' />
            <Tab label='Factures' />
          </Tabs>
          <TabPanel value={tabIndex} index={0} sx={TAB_PANEL_STYLE}>
            <InvoiceList onStateChange={stateChangeHandling} invoiceTypes={[InvoiceStatus.DRAFT]} handleSwitchTab={handleSwitchTab} />
          </TabPanel>
          <TabPanel value={tabIndex} index={1} sx={TAB_PANEL_STYLE}>
            <InvoiceList onStateChange={stateChangeHandling} invoiceTypes={[InvoiceStatus.PROPOSAL]} handleSwitchTab={handleSwitchTab} />
          </TabPanel>
          <TabPanel value={tabIndex} index={2} sx={TAB_PANEL_STYLE}>
            <InvoiceList onStateChange={stateChangeHandling} invoiceTypes={[InvoiceStatus.CONFIRMED, InvoiceStatus.PAID]} />
          </TabPanel>
        </Box>
      ) : viewScreen === viewScreenState.EDITION ? (
        <Card sx={{ border: 'none' }}>
          <CardHeader
            title={selectedInvoice.ref && selectedInvoice.ref.length === 0 ? 'Création' : 'Modification'}
            action={<CancelButton onClick={returnToList} />}
          />
          <CardContent>
            <InvoiceForm
              className={classes.form}
              onClose={returnToList}
              onPending={handlePending}
              selectedInvoiceRef={selectedInvoice.ref}
              documentUrl={documentUrl}
              toEdit={selectedInvoice}
              nbPendingInvoiceCrupdate={nbPendingInvoiceCrupdate}
            />
          </CardContent>
        </Card>
      ) : (
        <InvoicePdfDocument onClose={returnToList} selectedInvoice={selectedInvoice} />
      )}
    </Box>
  );
};

export default InvoiceListEditor;
