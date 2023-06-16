import zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldErrorMessage, requiredString } from './utils';
import { Product } from 'bpartners-react-client';

const isDate = (stringDate: string) => !new Date(stringDate).toString().includes('Invalid');
const dateBeforeToday = (stringDate: string) => isDate(stringDate) && new Date(stringDate) < new Date();
const validityDateAfterSendingDate = ({ sendingDate, validityDate }: any) => new Date(sendingDate) < new Date(validityDate);

const validityDPPValidator = ({ delayPenaltyPercent = '', delayInPaymentAllowed = '' }: any) =>
  !((delayInPaymentAllowed || "").length > 0 && (delayPenaltyPercent || "").length === 0);
const validityDIPAValidator = ({ delayPenaltyPercent, delayInPaymentAllowed }: any) =>
  !((delayInPaymentAllowed || "").length === 0 && (delayPenaltyPercent || "").length > 0);

const invoiceValidator = zod
  .object({
    title: requiredString(),
    ref: requiredString(),
    sendingDate: requiredString().refine(dateBeforeToday, { message: "La date d'émission doit être antérieure ou égale à la date d’aujourd’hui" }),
    validityDate: requiredString(),
    delayInPaymentAllowed: zod.custom(value => true),
    delayPenaltyPercent: zod.custom(value => true),
    globalDiscount: zod.custom(),
    customer: zod.object({}, { invalid_type_error: 'fr: customerRequired' }),
    products: zod
      .custom((products) => ((products as Product[]) || []).length > 0, { message: "fr: Product required" })
      .refine(checkProductQuantity, { message: "fr: Product quantity must be more than 0" }),
  })
  .refine(validityDateAfterSendingDate, { message: "La date limite de validité doit être ultérieure ou égale à la date d'émission", path: ["validityDate"] })
  .refine(validityDIPAValidator, {
    message: FieldErrorMessage.required,
    path: ['delayInPaymentAllowed'],
  })
  .refine(validityDPPValidator, {
    message: FieldErrorMessage.required,
    path: ['delayPenaltyPercent'],
  });

export const invoiceResolver = zodResolver(invoiceValidator);
function checkProductQuantity(arg: unknown) {
  const products = (arg as Product[]) || [];
  products.forEach(product => {
    if (!product?.quantity || +product.quantity <= 0) {
      return false
    }
  })
  return true;
}

