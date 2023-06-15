import { InvoiceStatus } from 'bpartners-react-client';
import InvoiceForm from './InvoiceForm';
import InvoicePdfDocument from './InvoicePdfDocument';
import { InvoiceContextProvider, InvoiceTabIndex, InvoiceTabPanel, InvoiceView } from './components';

// const useStyle = makeStyles(() => ({
//   card: { border: 'none' },
//   form: { transform: 'translateY(-1rem)' },
// }));

/**
 *
 *   const classes = useStyle();
 *   const [{ selectedInvoice, tabIndex, nbPendingInvoiceCrupdate, viewScreen, documentUrl }, dispatch] = useReducer(invoiceListReducer, invoiceListInitialState);
 *
 *   const stateChangeHandling = values => dispatch({ type: InvoiceActionType.SET, payload: values });
 *   const handlePending = (type, documentUrl) => dispatch({ type, payload: { documentUrl } });
 *
 *   const handleSwitchTab = (_e, newTabIndex) => stateChangeHandling({ tabIndex: newTabIndex });
 *
 *   const returnToList = invoice => {
 *     const newTabIndex = invoice && invoice.status === InvoiceStatus.CONFIRMED ? 2 : tabIndex;
 *     stateChangeHandling({ viewScreen: viewScreenState.LIST, tabIndex: newTabIndex });
 *   };
 */

const InvoiceListEditor = () => {
  return (
    <InvoiceContextProvider>
      <InvoiceView source='list'>
        <InvoiceTabIndex />
        <InvoiceTabPanel invoiceTypes={[InvoiceStatus.DRAFT]} tabSource='draft' />
        <InvoiceTabPanel invoiceTypes={[InvoiceStatus.PROPOSAL]} tabSource='proposal' />
        <InvoiceTabPanel invoiceTypes={[InvoiceStatus.CONFIRMED, InvoiceStatus.PAID]} tabSource='confirmed' />
      </InvoiceView>
      <InvoiceView sources={['edition', 'creation']}>
        <InvoiceForm />
      </InvoiceView>
      <InvoiceView source='preview'>
        <InvoicePdfDocument />
      </InvoiceView>
    </InvoiceContextProvider>
  );
};

export default InvoiceListEditor;
