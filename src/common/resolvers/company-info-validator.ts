import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FieldErrorMessage, phoneValidator, requiredString } from './utils';

const companyInfoValidator = z.object({
  socialCapital: requiredString(),
  phone: requiredString().refine(phoneValidator, FieldErrorMessage.accountPhone),
  email: z.string().min(1, FieldErrorMessage.required).email({ message: FieldErrorMessage.emailNotValid }),
  website: z.custom(() => true),
  townCode: requiredString().refine(value => value.length === 5, FieldErrorMessage.townCodeNotValid),
  tvaNumber: requiredString(),
});

export const companyInfoResolver = zodResolver(companyInfoValidator);
