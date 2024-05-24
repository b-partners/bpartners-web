import { InvoiceStatus } from '@bpartners/typescript-client';
import { Box, Card, CardContent, CardHeader } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useReducer, useState } from 'react';
import { useStore } from 'react-admin';
import { printError } from 'src/common/utils';
import { getInvoicesSummary } from 'src/providers';
import { InvoiceConfirmedPayedTabPanel } from './components';
import { InvoiceTabPanel } from './components/InvoiceTabPanel';
import { InvoiceTabs } from './components/InvoiceTabs';
import { InvoiceToolContextProvider } from './components/InvoiceToolContextProvider';
import { InvoiceView } from './components/InvoiceView';
import InvoiceForm from './InvoiceForm';
import InvoicePdfDocument, { ContextCancelButton } from './InvoicePdfDocument';
import { getReceiptUrl, InvoiceActionType, invoiceListInitialState, viewScreenState } from './utils/utils';

const useStyle = makeStyles(() => ({
  card: { border: 'none' },
  form: { transform: 'translateY(-1rem)' },
}));

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
  const [url, setUrl] = useState('');
  const classes = useStyle();
  const [{ selectedInvoice, tabIndex, nbPendingInvoiceCrupdate, documentUrl }, dispatch] = useReducer(invoiceListReducer, invoiceListInitialState);
  const stateChangeHandling = values => dispatch({ type: InvoiceActionType.SET, payload: values });
  const handlePending = (type, documentUrl) => dispatch({ type, payload: { documentUrl } });

  const returnToList = invoice => {
    const newTabIndex = invoice && invoice.status === InvoiceStatus.CONFIRMED ? 2 : tabIndex;
    stateChangeHandling({ viewScreen: viewScreenState.LIST, tabIndex: newTabIndex });
  };

  useEffect(() => {
    setUrl(getReceiptUrl(selectedInvoice.fileId, 'INVOICE'));
  }, [selectedInvoice]);

  const amounts = {
    paid: 0,
    unpaid: 0,
    proposal: 0,
  };
  const [, setInvoicesSummary] = useStore('amounts', amounts);

  useEffect(() => {
    const getInvoicesSummaryData = async () => {
      const { paid, unpaid, proposal } = await getInvoicesSummary();
      setInvoicesSummary({
        paid: paid.amount,
        unpaid: unpaid.amount,
        proposal: proposal.amount,
      });
    };
    getInvoicesSummaryData().catch(printError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <InvoiceToolContextProvider>
      <Box>
        <InvoiceView type={['list']}>
          <Box>
            <InvoiceTabs />
            <InvoiceTabPanel index={0} onStateChange={stateChangeHandling} type={[InvoiceStatus.DRAFT]} />
            <InvoiceTabPanel index={1} onStateChange={stateChangeHandling} type={[InvoiceStatus.PROPOSAL]} />
            <InvoiceConfirmedPayedTabPanel index={2} onStateChange={stateChangeHandling} />
          </Box>
        </InvoiceView>
        <InvoiceView type={['edition', 'creation']}>
          <Card sx={{ border: 'none' }}>
            <CardHeader
              title={!selectedInvoice.products || selectedInvoice.products.length === 0 ? 'Création' : 'Modification'}
              action={<ContextCancelButton />}
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
        </InvoiceView>
        <InvoiceView type={['preview']}>
          <InvoicePdfDocument selectedInvoice={selectedInvoice} url={url} />
        </InvoiceView>
      </Box>
    </InvoiceToolContextProvider>
  );
};

export default InvoiceListEditor;
