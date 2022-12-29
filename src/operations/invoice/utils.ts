import { getUserInfo } from 'src/providers/invoice-provider';
import { accessTokenItem } from 'src/providers/auth-provider';
import { BASE_PATH } from 'src/gen/bpClient/base';
import { InvoiceStatusEN, InvoiceStatusFR } from '../../constants/invoice-status';

/**
 * **INVOICE**
 */
export const invoiceDateValidator = (date1: string, date2?: string) => {
  if (date2) {
    if (date2.length === 0) {
      return 'Ce champ est requis';
    } else if (new Date(date1) < new Date(date2)) {
      return "La date d'envoie doit précéder celle du payement";
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
  return `${BASE_PATH}/accounts/${accountId}/files/${id}/raw?accessToken=${accessToken}&fileType=INVOICE`;
};

type InvoiceStatusLabel = keyof typeof InvoiceStatusEN;

export const getInvoiceStatusInFr = (status: InvoiceStatusLabel): string => {
  switch (status) {
    case InvoiceStatusEN.PAYED:
      return InvoiceStatusFR.PAYED;
    case InvoiceStatusEN.PROPOSAL:
      return InvoiceStatusFR.PROPOSAL;
    case InvoiceStatusEN.DRAFT:
      return InvoiceStatusFR.DRAFT;
    case InvoiceStatusEN.CONFIRMED:
      return InvoiceStatusFR.CONFIRMED;
    case InvoiceStatusEN.ACCEPTED:
      return InvoiceStatusFR.ACCEPTED;
    default:
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
  status: InvoiceStatusEN.DRAFT,
  comment: '',
};

// viewScreen, if true display the list and the preview of the document else display the form and the pdf preview
export const invoiceListInitialState = {
  tabIndex: 0,
  selectedInvoice: invoiceInitialValue,
  isPending: 0,
  viewScreen: viewScreenState.LIST,
};

// CONSTANT
export const PDF_WIDTH = window.screen.width * 0.7;
