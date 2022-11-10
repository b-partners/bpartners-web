import PdfViewer from '../utils/PdfViewer';
import TabPanel from '../utils/TabPanel';
import InvoiceCreateOrUpdate from './InvoiceCreate';
import InvoiceListTable from './InvoiceListTable';
import { getInvoicePdfUrl, invoiceListInitialState } from './utils';
import { Clear } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { Box, Tabs, Tab, Card, CardHeader, CardContent, IconButton, Tooltip } from '@mui/material';
import { useState, useEffect, useReducer } from 'react';

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
        <PdfViewer url={documentUrl} />
      </CardContent>
    </Card>
  );
};

const invoiceListReducer = (state, { type, payload }) => {
  switch (type) {
    case 'startPending':
      return { ...state, isPending: true, documentUrl: payload.documentUrl };
    case 'stopPending':
      return { ...state, isPending: false, documentUrl: payload.documentUrl };
    case 'set':
      return { ...state, ...payload };
    default:
      throw new Error('Unknown action type');
  }
};

const InvoiceList = () => {
  const classes = useStyle();
  const [{ selectedInvoice, tabIndex, isPending, viewScreen, documentUrl }, dispatch] = useReducer(invoiceListReducer, invoiceListInitialState);

  const stateHandling = values => dispatch({ type: 'set', payload: values });
  const handlePending = (type, documentUrl) => dispatch({ type, payload: { documentUrl } });
  const handleSwitchTab = (e, newTabIndex) => dispatch({ type: 'set', payload: { tabIndex: newTabIndex } });
  const returnToList = () => stateHandling({ viewScreen: 'lists' });

  return (
    <Box sx={{ padding: 3 }}>
      {viewScreen === 'lists' ? (
        <Box>
          <Tabs value={tabIndex} onChange={handleSwitchTab} variant='fullWidth'>
            <Tab label='Brouillons' />
            <Tab label='Devis' />
            <Tab label='Factures' />
          </Tabs>
          <TabPanel value={tabIndex} index={0} sx={TAB_PANEL_STYLE}>
            <InvoiceListTable stateHandling={stateHandling} invoiceType='DRAFT' />
          </TabPanel>
          <TabPanel value={tabIndex} index={1} sx={TAB_PANEL_STYLE}>
            <InvoiceListTable stateHandling={stateHandling} invoiceType='PROPOSAL' />
          </TabPanel>
          <TabPanel value={tabIndex} index={2} sx={TAB_PANEL_STYLE}>
            <InvoiceListTable stateHandling={stateHandling} invoiceType='CONFIRMED' />
          </TabPanel>
        </Box>
      ) : viewScreen === 'edition' ? (
        <Card>
          <CardHeader title={selectedInvoice.ref.length > 0 ? 'Modification' : 'Création'} action={<CancelButton onClick={returnToList} />} />
          <CardContent>
            <Box sx={{ display: 'flex', width: 'inherit', flexWrap: 'wrap', justifyContent: 'space-around' }}>
              <InvoiceCreateOrUpdate onPending={handlePending} toEdit={selectedInvoice} />
              <PdfViewer url={documentUrl} isPending={isPending} className={classes.document} />
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
