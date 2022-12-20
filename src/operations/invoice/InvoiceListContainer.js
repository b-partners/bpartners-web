import { Clear } from '@mui/icons-material';
import { Box, Card, CardContent, CardHeader, IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useReducer, useState } from 'react';
import { InvoiceStatusEN } from '../../constants/invoice-status';
import PdfViewer from '../utils/PdfViewer';
import TabPanel from '../utils/TabPanel';
import InvoiceCreateOrUpdate from './InvoiceCreate';
import InvoiceList from './InvoiceList';
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

const InvoicePdf = ({ selectedInvoice, onClose }) => {
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

const InvoiceListContainer = () => {
  const classes = useStyle();
  const [{ selectedInvoice, tabIndex, isPending, viewScreen, documentUrl }, dispatch] = useReducer(invoiceListReducer, invoiceListInitialState);

  const stateHandling = values => dispatch({ type: InvoiceActionType.SET, payload: values });

  const handlePending = (type, documentUrl) => dispatch({ type, payload: { documentUrl } });

  const handleSwitchTab = (e, newTabIndex) =>
    dispatch({
      type: InvoiceActionType.SET,
      payload: { tabIndex: newTabIndex },
    });

  const backToList = () => stateHandling({ viewScreen: viewScreenState.LIST });

  return (
    <Box sx={{ padding: 3 }}>
      {
        // TODO: using nested ternary operator makes the code harder to read refactor this
        viewScreen === viewScreenState.LIST ? (
          <Box>
            <Tabs value={tabIndex} onChange={handleSwitchTab} variant='fullWidth'>
              <Tab label='Brouillons' />
              <Tab label='Devis' />
              <Tab label='Factures' />
            </Tabs>
            <TabPanel value={tabIndex} index={0} sx={TAB_PANEL_STYLE}>
              <InvoiceList stateHandling={stateHandling} invoiceType={InvoiceStatusEN.DRAFT} />
            </TabPanel>
            <TabPanel value={tabIndex} index={1} sx={TAB_PANEL_STYLE}>
              <InvoiceList stateHandling={stateHandling} invoiceType={InvoiceStatusEN.PROPOSAL} />
            </TabPanel>
            <TabPanel value={tabIndex} index={2} sx={TAB_PANEL_STYLE}>
              <InvoiceList stateHandling={stateHandling} invoiceType={InvoiceStatusEN.CONFIRMED} />
            </TabPanel>
          </Box>
        ) : viewScreen === viewScreenState.EDITION ? (
          <Card>
            <CardHeader
              title={selectedInvoice.ref && selectedInvoice.ref.length === 0 ? 'Création' : 'Modification'}
              action={<CancelButton onClick={backToList} />}
            />
            <CardContent>
              <Box sx={{ display: 'flex', width: 'inherit', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                <InvoiceCreateOrUpdate close={backToList} onPending={handlePending} toEdit={selectedInvoice} isPending={isPending} />
                <PdfViewer url={documentUrl} isPending={isPending > 0} className={classes.document} />
              </Box>
            </CardContent>
          </Card>
        ) : (
          <InvoicePdf onClose={backToList} selectedInvoice={selectedInvoice} />
        )
      }
    </Box>
  );
};

export default InvoiceListContainer;
