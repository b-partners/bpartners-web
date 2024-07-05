import { InvoiceStatus } from '@bpartners/typescript-client';
import { Box, Card, CardContent, CardHeader } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useReducer, useState } from 'react';
import { useStore } from 'react-admin';
import { AnnotationInfo } from '../annotator/components';
import { InvoiceConfirmedPayedTabPanel, InvoiceTabPanel, InvoiceTabs, InvoiceToolContextProvider, InvoiceView } from './components';

import { printError } from 'src/common/utils';
import { getInvoicesSummary } from 'src/providers';
import AnnotatorComponent from '../annotator/AnnotatorComponent';
import InvoiceForm from './InvoiceForm';
import InvoicePdfDocument, { ContextCancelButton } from './InvoicePdfDocument';
import { useRetrievePolygons } from './utils/use-retrieve-polygons';
import { getReceiptUrl, InvoiceActionType, invoiceListInitialState, PDF_EDITION_WIDTH, viewScreenState } from './utils/utils';

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

const AnnotatorComponentShow = () => {
  const { polygons, isAnnotationEmpty, annotations } = useRetrievePolygons();

  if (isAnnotationEmpty) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, justifyContent: 'center', width: '100%', mt: 2 }}>
      <Box sx={{ width: '333px' }}>
        {annotations?.annotations.map((annotation, index) => (
          <AnnotationInfo areaPictureAnnotationInstance={annotation} key={index} />
        ))}
      </Box>
      <Box width={PDF_EDITION_WIDTH}>
        <AnnotatorComponent width={PDF_EDITION_WIDTH} allowAnnotation={false} polygons={polygons} allowSelect={false} />
      </Box>
    </Box>
  );
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
              action={<ContextCancelButton clearUrlParams={true} />}
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
          <InvoicePdfDocument selectedInvoice={selectedInvoice} url={url}>
            <AnnotatorComponentShow />
          </InvoicePdfDocument>
        </InvoiceView>
      </Box>
    </InvoiceToolContextProvider>
  );
};

export default InvoiceListEditor;
