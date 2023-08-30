import { Alert, Box, Card, CardContent, CardHeader, Link } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { InvoiceStatus } from 'bpartners-react-client';
import React, { useReducer } from 'react';
import InvoiceForm from './InvoiceForm';
import InvoicePdfDocument, { ContextCancelButton } from './InvoicePdfDocument';
import { InvoiceActionType, invoiceListInitialState, viewScreenState } from './utils/utils';
import { InvoiceToolContextProvider } from './components/InvoiceToolContextProvider';
import { InvoiceTabs } from './components/InvoiceTabs';
import { InvoiceTabPanel } from './components/InvoiceTabPanel';
import { InvoiceView } from './components/InvoiceView';
import { InvoiceConfirmedPayedTabPanel } from './components';

const useStyle = makeStyles(() => ({
  card: { border: 'none' },
  form: { transform: 'translateY(-1rem)' },
}));

const invoiceListReducer = (state, { type, payload }) => {
  switch (type) {
    case InvoiceActionType.START_PENDING:
      return {
        ...state,
        nbPendingInvoiceCrupdate: state.nbPendingInvoiceCrupdate + 1,
        documentUrl: payload.documentUrl,
      };
    case InvoiceActionType.STOP_PENDING:
      return {
        ...state,
        nbPendingInvoiceCrupdate: state.nbPendingInvoiceCrupdate - 1,
        documentUrl: payload.documentUrl,
      };
    case InvoiceActionType.SET:
      return { ...state, ...payload };
    default:
      throw new Error('Unknown action type');
  }
};

const InvoiceListEditor = () => {
  const classes = useStyle();
  const [{ selectedInvoice, tabIndex, nbPendingInvoiceCrupdate, documentUrl }, dispatch] = useReducer(invoiceListReducer, invoiceListInitialState);
  const stateChangeHandling = values => dispatch({ type: InvoiceActionType.SET, payload: values });
  const handlePending = (type, documentUrl) => dispatch({ type, payload: { documentUrl } });

  const returnToList = invoice => {
    const newTabIndex = invoice && invoice.status === InvoiceStatus.CONFIRMED ? 2 : tabIndex;
    stateChangeHandling({ viewScreen: viewScreenState.LIST, tabIndex: newTabIndex });
  };

  return (
    <InvoiceToolContextProvider>
      <Box>
        <InvoiceView type={['list']}>
          <Box>
            <Alert severity='warning'>
              La liste des factures rencontre momentanément quelques difficultés qui sont en train d'être corrigées. Veuillez contacter le support au numéro{' '}
              <Link href='tel:0184803169'>01 84 80 31 69</Link> ou par email à <Link href='mailto:contact@bpartners.app'>contact@bpartners.app</Link> en cas
              d'urgence.
            </Alert>
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
          <InvoicePdfDocument selectedInvoice={selectedInvoice} />
        </InvoiceView>
      </Box>
    </InvoiceToolContextProvider>
  );
};

export default InvoiceListEditor;
