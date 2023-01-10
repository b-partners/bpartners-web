import { getUserInfo } from 'src/providers/invoice-provider';
import { accessTokenItem } from 'src/providers/auth-provider';
import { InvoiceStatusFR } from '../../constants/invoice-status';
import { InvoiceStatus } from 'bpartners-react-client';
import { Invoice } from 'bpartners-react-client';

/**
 * **INVOICE**
 */
export const invoiceDateValidator = (date1: string, date2?: string) => {
  if (date2) {
    if (date2.length === 0) {
      return 'Ce champ est requis';
    } else if (new Date(date1) < new Date(date2)) {
      return "La date d'envoie doit précéder celle du paiement";
    }
  } else if (date1.length === 0) {
    return 'Ce champ est requis';
  } else if (new Date() < new Date(date1)) {
    return "La date d'envoie doit précéder celle d'aujourd'hui";
  }
  return true;
};

export const getInvoicePdfUrl = async (id: string) => {
  const { accountId } = await getUserInfo();
  const accessToken = localStorage.getItem(accessTokenItem) || '';
  return `${process.env.REACT_APP_BPARTNERS_API_URL}/accounts/${accountId}/files/${id}/raw?accessToken=${accessToken}&fileType=INVOICE`;
};

type InvoiceStatusLabel = keyof typeof InvoiceStatus;

export const getInvoiceStatusInFr = (status: InvoiceStatusLabel): string => {
  switch (status) {
    case InvoiceStatus.PAID:
      return InvoiceStatusFR.PAID;
    case InvoiceStatus.PROPOSAL:
      return InvoiceStatusFR.PROPOSAL;
    case InvoiceStatus.DRAFT:
      return InvoiceStatusFR.DRAFT;
    case InvoiceStatus.CONFIRMED:
      return InvoiceStatusFR.CONFIRMED;
    case InvoiceStatus.ACCEPTED:
      return InvoiceStatusFR.ACCEPTED;
    default:
      //TODO: bad
      throw new Error(`Unknown status: ${status}`);
  }
};

export const InvoiceActionType = {
  START_PENDING: 'startPending',
  STOP_PENDING: 'stopPending',
  SET: 'set',
};

export const ProductActionType = {
  UPDATE: 'update',
  REMOVE: 'remove',
  ADD: 'add',
};

export const viewScreenState = {
  LIST: 'lists',
  EDITION: 'edition',
  PREVIEW: 'preview',
};

const generatedInvoiceRef = () => {
  const todayDate = new Date()
    .toLocaleString('fr-ca')
    .replace(/[:hmins\- ]/g, '')
    .slice(2, 12);
  return `REF-${todayDate}`;
};

export const invoiceInitialValue: any = {
  id: '',
  ref: generatedInvoiceRef(),
  title: 'Nouveau devis',
  customer: null,
  products: [],
  sendingDate: new Date().toLocaleDateString('fr-ca'),
  toPayAt: new Date().toLocaleDateString('fr-ca'),
  status: InvoiceStatus.DRAFT,
  comment: '',
};

// viewScreen, if true display the list and the preview of the document else display the form and the pdf preview
export const invoiceListInitialState = {
  tabIndex: 0,
  selectedInvoice: invoiceInitialValue,
  nbPendingInvoiceCrupdate: 0,
  viewScreen: viewScreenState.LIST,
};

// CONSTANT
export const PDF_WIDTH = window.screen.width * 0.7;

// check that all informations in one invoice are correct
// - had title, ref, customer and products
// - all products had quantity > 0
export const draftInvoiceValidator = (invoice: Invoice) => {
  if (invoice.ref.length === 0 || invoice.title.length === 0 || !invoice.customer || invoice.products.length === 0) {
    return false;
  }
  for (let product of invoice.products) {
    if (product.quantity === 0) {
      return false;
    }
  }
  return true;
};

export const retryOnError = async (f: any, isErrorRetriable: any) => {
  try {
    await f();
  } catch (e) {
    if (isErrorRetriable(e)) {
      retryOnError(f, isErrorRetriable);
    } else {
      throw e;
    }
  }
};

export const invoiceRefTranslate = (ref: string): string => {
  return ref.includes('DRAFT') ? ref.replace('DRAFT', 'DEVIS') : ref;
};
