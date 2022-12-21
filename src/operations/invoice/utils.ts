import { Product } from 'src/gen/bpClient';
import { getUserInfo } from 'src/providers/invoice-provider';
import { accessTokenItem } from 'src/providers/auth-provider';
import { BASE_PATH } from 'src/gen/bpClient/base';
import { InvoiceStatusEN, InvoiceStatusFR } from '../../constants/invoice-status';

/**
 * **PRODUCT**
 */
export const totalCalculus = (products: Product[] = []) => {
  if (products.length === 0) return 0;
  const prodTemp = normalizeProd(products);
  const localVarTotalPrice = getProdTotalPrice(...prodTemp);
  return localVarTotalPrice.reduce((prev, curr) => prev + curr, 0).toFixed(2);
};

export const getProdTotalPrice = (...products: Product[]) => {
  return products.map(({ quantity, unitPrice, totalVat }) => {
    return quantity * unitPrice + totalVat;
  });
};

const normalizeProd = (products: Product[] = []) => {
  const localDefaultQuantity = {
    MIN: 0,
    INIT: 1,
  };

  return (products || []).map(product => {
    if (!product) return {};

    let { quantity, vatPercent } = product;

    const hasMinQuantity = quantity === 0;
    const hasInvalidQuantity = !quantity && quantity !== 0;

    if (hasInvalidQuantity) {
      quantity = localDefaultQuantity.MIN;
    } else if (hasMinQuantity) {
      quantity = localDefaultQuantity.INIT;
    }

    if (vatPercent > 0) {
      vatPercent /= 100;
    }

    return { ...product, quantity, vatPercent };
  });
};

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

export const ViewScreenState = {
  LIST: 'lists',
  EDITION: 'edition',
  PREVIEW: 'preview',
};

export const InvoiceInitialValue: any = {
  id: '',
  ref: '',
  title: '',
  customer: null,
  products: [],
  sendingDate: '',
  toPayAt: '',
  status: InvoiceStatusEN.DRAFT,
  comment: '',
};

// viewScreen, if true display the list and the preview of the document else display the form and the pdf preview
export const invoiceListInitialState = {
  tabIndex: 0,
  selectedInvoice: InvoiceInitialValue,
  isPending: 0,
  viewScreen: ViewScreenState.LIST,
};

// CONSTANT
export const PDF_WIDTH = window.screen.width * 0.7;
