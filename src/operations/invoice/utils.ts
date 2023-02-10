import { getUserInfo } from 'src/providers/invoice-provider';
import { accessTokenItem } from 'src/providers/auth-provider';
import { InvoiceStatusFR } from '../../constants/invoice-status';
import { Attachment, CreateAttachment, Invoice, InvoiceStatus, Product } from 'bpartners-react-client';
import { getFilenameMeta } from '../utils/file';

/**
 * **INVOICE**
 */

// utility value
export const DELAY_PENALTY_PERCENT = 'delayPenaltyPercent';
export const DEFAULT_DELAY_PENALTY_PERCENT = 5;
export const PRODUCT_NAME = 'products';

// invoice validator
type InvoiceValidatorParams = {
  sendingDate?: string;
  validityDate?: string;
};

type ProductValidatorResult = {
  isValid: boolean;
  message?: string;
};

export const MAX_ATTACHMENT_NAME_LENGTH = 50;

export const fileToAttachmentApi = (reader: FileReader, file: File): CreateAttachment => {
  const { name } = getFilenameMeta(file.name);
  return {
    name,
    content: (reader.result as string).split(',')[1],
  };
};

const sendingDateValidator = (sendingDate: Date) => {
  const currentDate = new Date();
  if (!sendingDate) {
    return 'Ce champ est requis';
  } else if (sendingDate.getTime() > currentDate.getTime()) {
    return "La date d'émission doit être antérieure ou égale à la date d’aujourd’hui";
  }
  return true;
};

const toPayAtValidator = (toPayAtDate: Date) => {
  if (!toPayAtDate) {
    return 'Ce champ est requis';
  }
  return true;
};

const stringDateValidator = (stringDate: string) => (stringDate && stringDate.length === 10 ? true : false);

export const invoiceDateValidator = (dates: InvoiceValidatorParams) => {
  const { sendingDate, validityDate } = dates;
  if (!stringDateValidator(sendingDate) && !stringDateValidator(validityDate)) {
    return 'Ce champ est requis';
  } else if (stringDateValidator(sendingDate) && !stringDateValidator(validityDate)) {
    return sendingDateValidator(new Date(sendingDate));
  } else if (!stringDateValidator(sendingDate) && stringDateValidator(validityDate)) {
    return toPayAtValidator(new Date(validityDate));
  } else if (new Date(sendingDate) > new Date(validityDate)) {
    return "La date limite de validité doit être ultérieure ou égale à la date d'émission";
  }
  return true;
};

export const productValidator = (products: Product[]): ProductValidatorResult => {
  if (!products || products.length === 0) {
    return { isValid: false, message: 'Veuillez sélectionner au moins un produit' };
  }
  for (let product of products) {
    if (!product.quantity || product.quantity === 0) {
      return { isValid: false, message: 'La quantité de chaque produit doit être supérieur à zéro (0)' };
    }
  }
  return { isValid: true };
};

export const productValidationHandling = (product: Product[], name: string, setError: any, clearErrors: any) => {
  /**
   * function that creates an error when the products are not valid and
   * clears the errors if they are valid
   */
  const productValidation = productValidator(product);
  if (!productValidation.isValid) {
    setError(name, { message: productValidation.message });
  } else {
    clearErrors(name);
  }
};

export const getInvoicePdfUrl = async (id: string) => {
  const { accountId } = await getUserInfo();
  const accessToken = localStorage.getItem(accessTokenItem) || '';
  return `${process.env.REACT_APP_BPARTNERS_API_URL}/accounts/${accountId}/files/${id}/raw?accessToken=${accessToken}&fileType=INVOICE`;
};

export const totalPriceWithVatFromProductQuantity = (product: Product): number => product.quantity * product.unitPriceWithVat;
export const totalPriceWithoutVatFromProductQuantity = (product: Product): number => product.quantity * product.unitPrice;
export const totalVatFromProductQuantity = (product: Product): number => (product.quantity * product.unitPrice * product.vatPercent) / 100 / 100;

export const totalPriceWithVatFromProducts = (products: Array<Product>): number =>
  products != null && products.length > 0
    ? products.map(product => totalPriceWithVatFromProductQuantity(product)).reduce((price1, price2) => price1 + price2)
    : 0;

export const totalPriceWithoutVatFromProducts = (products: Array<Product>): number =>
  products != null && products.length > 0
    ? products.map(product => totalPriceWithoutVatFromProductQuantity(product)).reduce((price1, price2) => price1 + price2)
    : 0;

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
  validityDate: new Date().toLocaleDateString('fr-ca'),
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
  if (
    invoice.ref.length === 0 ||
    invoice.title.length === 0 ||
    !invoice.customer ||
    invoice.products.length === 0 ||
    !productValidator(invoice.products).isValid
  ) {
    return false;
  }
  return true;
};

export const retryOnError = async (f: any, isErrorRetriable: any, backoffMillis = 1_000) => {
  try {
    await f();
  } catch (e) {
    if (isErrorRetriable(e)) {
      await new Promise(r => setTimeout(r, backoffMillis));
      retryOnError(f, isErrorRetriable, 2 * backoffMillis);
    } else {
      throw e;
    }
  }
};
