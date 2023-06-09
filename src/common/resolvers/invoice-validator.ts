import zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldErrorMessage, requiredString } from './utils';

const isDate = (stringDate: string) => !new Date(stringDate).toString().includes('Invalid');
const dateBeforeToday = (stringDate: string) => isDate(stringDate) && new Date(stringDate) < new Date();
const validityDateAfterSendingDate = ({ sendingDate, validityDate }: any) => new Date(sendingDate) < new Date(validityDate);

const validityDPPValidator = ({ delayPenaltyPercent = '', delayInPaymentAllowed = '' }: any) =>
  !(delayInPaymentAllowed.length > 0 && delayPenaltyPercent.length === 0);
const validityDIPAValidator = ({ delayPenaltyPercent = '', delayInPaymentAllowed = '' }: any) =>
  !(delayInPaymentAllowed.length === 0 && delayPenaltyPercent.length > 0);

const invoiceValidator = zod
  .object({
    title: requiredString(),
    ref: requiredString(),
    sendingDate: requiredString().refine(dateBeforeToday, { message: "La date d'émission doit être antérieure ou égale à la date d’aujourd’hui" }),
    validityDate: requiredString(),
    delayInPaymentAllowed: zod.string(),
    delayPenaltyPercent: zod.string(),
    globalDiscount: zod.custom(),
    customer: zod.object({}, { invalid_type_error: 'fr: customerRequired' }),
    product: zod
      .object({
        quantity: zod.string(),
      })
      .refine(({ quantity }) => quantity && quantity.length > 0, { message: 'fr: productQuantityRequired' })
      .refine(({ quantity }) => +quantity > 0, { message: 'fr: productQuantityMinOne' })
      .array()
      .nonempty({ message: 'fr: productRequired' }),
  })
  .refine(validityDateAfterSendingDate, { message: "La date limite de validité doit être ultérieure ou égale à la date d'émission" })
  .refine(validityDIPAValidator, {
    message: FieldErrorMessage.required,
    path: ['delayInPaymentAllowed'],
  })
  .refine(validityDPPValidator, {
    message: FieldErrorMessage.required,
    path: ['delayPenaltyPercent'],
  });

export const invoiceResolver = zodResolver(invoiceValidator);
