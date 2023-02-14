import { Clear } from '@mui/icons-material';
import { Box, Card, CardContent, CardHeader, IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useReducer, useState } from 'react';
import { InvoiceStatus } from 'bpartners-react-client';
import PdfViewer from '../../common/components/PdfViewer';
import TabPanel from '../../common/components/TabPanel';
import InvoiceForm from './InvoiceForm';
import InvoiceList from './InvoiceList';
import { getInvoicePdfUrl, InvoiceActionType, invoiceListInitialState, PDF_WIDTH, viewScreenState } from './utils';

const useStyle = makeStyles(() => ({
  card: { border: 'none' },
  form: { transform: 'translateY(-1rem)' },
}));

const TAB_PANEL_STYLE = { padding: 0 };

const CancelButton = ({ onClick }) => (
  <Tooltip title='Retourner a la liste'>
    <IconButton onClick={onClick}>
      <Clear />
    </IconButton>
  </Tooltip>
);

const InvoicePdfDocument = ({ selectedInvoice, onClose }) => {
  const [documentUrl, setDocumentUrl] = useState('');
  const classes = useStyle();

  useEffect(() => {
    getInvoicePdfUrl(selectedInvoice.fileId).then(pdfUrl => setDocumentUrl(pdfUrl));
  }, [selectedInvoice]);

  return (
    <Card className={classes.card}>
      <CardHeader action={<CancelButton onClick={onClose} />} title={selectedInvoice.title} subheader={selectedInvoice.ref} />
      <CardContent>
        <PdfViewer width={PDF_WIDTH} url={documentUrl} filename={selectedInvoice.ref} />
      </CardContent>
    </Card>
  );
};

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
  const handleSwitchTab = (_e, newTabIndex) => {
    dispatch({
      type: InvoiceActionType.SET,
      payload: { tabIndex: newTabIndex },
    });
  };
  const returnToList = invoice => {
    stateChangeHandling({ viewScreen: viewScreenState.LIST });
    if (invoice && invoice.status === InvoiceStatus.CONFIRMED) {
      handleSwitchTab(null, 2);
    } else {
      handleSwitchTab(null, 0);
    }
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
        <Card className={classes.card}>
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
