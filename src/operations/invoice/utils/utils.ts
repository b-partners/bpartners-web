import { CreateAttachment, Invoice, InvoiceStatus, Product } from 'bpartners-react-client';
import { getFileUrl, getFilenameMeta } from '../../../common/utils';
import { InvoiceStatusFR } from '../../../constants';
import { printError } from 'src/common/utils';
import { getCached } from 'src/providers/cache';
import { ContentState, EditorState, convertFromHTML } from 'draft-js';
import { PaymentRegulationStatusFR } from '../../../constants/payment-regulation-status';

/**
 * **INVOICE**
 */

// utility value
export const DELAY_PENALTY_PERCENT = 'delayPenaltyPercent';
export const DELAY_IN_PAYMENT_ALLOWED = 'delayInPaymentAllowed';
export const PRODUCT_NAME = 'products';
export const CUSTOMER_NAME = 'customer';
export const TOTAL_PRICE_WITH_VAT = 'totalPriceWithVat';
export const TOTAL_PRICE_WITHOUT_VAT = 'totalPriceWithoutVat';
export const DEFAULT_GLOBAL_DISCOUNT = 0;
export const GLOBAL_DISCOUNT = 'globalDiscount';
export const PERCENT_VALUE = 'percentValue';
export const GLOBAL_DISCOUNT_PERCENT_VALUE = `${GLOBAL_DISCOUNT}.${PERCENT_VALUE}`;
export const SENDING_DATE = 'sendingDate';
export const VALIDITY_DATE = 'validityDate';
// invoice validator
export const InvoiceFieldErrorMessage =
  'Veuillez vérifier que tous les champs ont été remplis correctement. Notamment chaque produit doit avoir une quantité supérieure à 0';
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

export const titleValidator = (title: string) => {
  const titlePattern = /^[-a-zA-Z0-9éèêëçâùûôî.,;:/!?$%_=+()*°@#ÂÇÉÈÊËÎÔÙÛ\s]{0,140}$/;
  if (!title && title.length === 0) {
    return 'Ce champ est requis';
  } else if (!titlePattern.test(title)) {
    return 'Le titre ne doit pas contenir des caractères spéciales autres que "éèêëçâùûôî.,;:/!?$%_=+()*°@#ÂÇÉÈÊËÎÔÙÛ"';
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
  if ((products || []).length === 0) {
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

export const getInvoicePdfUrl = (id: string) => getFileUrl(id, 'INVOICE');

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

export const getPaymentRegulationStatusInFr = (status: string): string => {
  switch (status) {
    case 'PAID':
      return PaymentRegulationStatusFR.PAID;
    case 'UNPAID':
      return PaymentRegulationStatusFR.UNPAID;
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

export const invoiceInitialValue: Invoice = {
  ref: generatedInvoiceRef(),
  title: 'Nouveau devis',
  products: [],
  sendingDate: new Date().toLocaleDateString('fr-ca'),
  validityDate: new Date().toLocaleDateString('fr-ca'),
  status: InvoiceStatus.DRAFT,
  comment: '',
  paymentType: 'CASH',
  paymentRegulations: [],
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
export const PDF_EDITION_WIDTH = window.screen.width * 0.45;

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
      retryOnError(f, isErrorRetriable, 2 * backoffMillis).catch(printError);
    } else {
      throw e;
    }
  }
};

export enum EInvoiceModalType {
  RELAUNCH = 'relaunch',
  FEEDBACK = 'feedback',
}

export const getFeedbackDefaultMessage = (invoice: Invoice) => {
  const customer = invoice?.customer;
  const { feedback, name: companyName } = getCached.accountHolder() || { feedback: { feedbackLink: '' } };
  const { phone } = getCached.user() || {};
  const { feedbackLink } = feedback || {};
  const message = `<p>Cher(e) ${customer?.firstName} ${customer?.lastName},<br/><br/>
Nous espérons que vous allez bien. Nous vous remercions encore une fois d'avoir choisi ${companyName}.
Nous espérons que vous avez été satisfait de notre travail et que nous avons répondu à vos attentes.<br/>
Nous aimerions vous demander si vous seriez prêt(e) à laisser un avis  à propos de votre expérience avec notre entreprise.
Nous attachons une grande importance aux avis de nos clients car ils nous aident à améliorer nos services et à offrir une meilleure expérience à l'avenir. 
Si vous avez 1 minute à nous accorder, voici le lien direct vers notre page de recueil d’avis où vous pouvez laisser un avis : 
<a href="${feedbackLink}">${feedbackLink}</a>.<br/><br/>
Nous vous remercions par avance pour votre temps et votre avis. 
N'hésitez pas à nous contacter si vous avez des questions ou des préoccupations.<br/><br/>
Cordialement,<br/>
${companyName}<br/>
${phone}</p>`;
  const blocksFromHtml = convertFromHTML(message);
  const defaultContentState = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks, blocksFromHtml.entityMap);

  return EditorState.createWithContent(defaultContentState);
};
