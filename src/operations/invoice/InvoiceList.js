import { Clear } from '@mui/icons-material';
import { Box, Card, CardContent, CardHeader, IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useReducer, useState } from 'react';
import { InvoiceStatusEN } from '../../constants/invoice-status';
import PdfViewer from '../utils/PdfViewer';
import TabPanel from '../utils/TabPanel';
import InvoiceCreateOrUpdate from './InvoiceCreate';
import Invoice from './Invoice';
import { getInvoicePdfUrl, InvoiceActionType, invoiceListInitialState, PDF_WIDTH, viewScreenState } from './utils';

const useStyle = makeStyles(() => ({
  document: { width: '60%' },
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

  useEffect(() => {
    getInvoicePdfUrl(selectedInvoice.fileId).then(pdfUrl => setDocumentUrl(pdfUrl));
  }, [selectedInvoice]);

  return (
    <Card>
      <CardHeader action={<CancelButton onClick={onClose} />} title={selectedInvoice.title} subheader={selectedInvoice.ref} />
      <CardContent>
        <PdfViewer width={PDF_WIDTH} url={documentUrl} />
      </CardContent>
    </Card>
  );
};

const invoiceListReducer = (state, { type, payload }) => {
  switch (type) {
    case InvoiceActionType.START_PENDING:
      return { ...state, isPending: state.isPending + 1, documentUrl: payload.documentUrl };
    case InvoiceActionType.STOP_PENDING:
      return { ...state, isPending: state.isPending - 1, documentUrl: payload.documentUrl };
    case InvoiceActionType.SET:
      return { ...state, ...payload };
    default:
      throw new Error('Unknown action type');
  }
};

const InvoiceList = () => {
  const classes = useStyle();
  const [{ selectedInvoice, tabIndex, isPending, viewScreen, documentUrl }, dispatch] = useReducer(invoiceListReducer, invoiceListInitialState);

  const stateChangeHandling = values => dispatch({ type: InvoiceActionType.SET, payload: values });
  const handlePending = (type, documentUrl) => dispatch({ type, payload: { documentUrl } });
  const handleSwitchTab = (e, newTabIndex) =>
    dispatch({
      type: InvoiceActionType.SET,
      payload: { tabIndex: newTabIndex },
    });
  const returnToList = () => stateChangeHandling({ viewScreen: viewScreenState.LIST });

  return (
    <Box sx={{ padding: 3 }}>
      {viewScreen === viewScreenState.LIST ? (
        <Box>
          <Tabs value={tabIndex} onChange={handleSwitchTab} variant='fullWidth'>
            <Tab label='Brouillons' />
            <Tab label='Devis' />
            <Tab label='Factures' />
          </Tabs>
          <TabPanel value={tabIndex} index={0} sx={TAB_PANEL_STYLE}>
            <Invoice onStateChange={stateChangeHandling} invoiceType={InvoiceStatusEN.DRAFT} />
          </TabPanel>
          <TabPanel value={tabIndex} index={1} sx={TAB_PANEL_STYLE}>
            <Invoice onStateChange={stateChangeHandling} invoiceType={InvoiceStatusEN.PROPOSAL} />
          </TabPanel>
          <TabPanel value={tabIndex} index={2} sx={TAB_PANEL_STYLE}>
            <Invoice onStateChange={stateChangeHandling} invoiceType={InvoiceStatusEN.CONFIRMED} />
          </TabPanel>
        </Box>
      ) : viewScreen === viewScreenState.EDITION ? (
        <Card>
          <CardHeader
            title={selectedInvoice.ref && selectedInvoice.ref.length === 0 ? 'Création' : 'Modification'}
            action={<CancelButton onClick={returnToList} />}
          />
          <CardContent>
            <Box sx={{ display: 'flex', width: 'inherit', flexWrap: 'wrap', justifyContent: 'space-around' }}>
              <InvoiceCreateOrUpdate onClose={returnToList} onPending={handlePending} toEdit={selectedInvoice} isPending={isPending} />
              <PdfViewer url={documentUrl} isPending={isPending > 0} className={classes.document} />
            </Box>
          </CardContent>
        </Card>
      ) : (
        <InvoicePdfDocument onClose={returnToList} selectedInvoice={selectedInvoice} />
      )}
    </Box>
  );
};

export default InvoiceList;
