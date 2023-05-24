import zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldErrorMessage, phoneValidator, requiredString } from './utils';

const companyInfoValidator = zod.object({
  socialCapital: requiredString(),
  phone: requiredString().refine(phoneValidator, FieldErrorMessage.phone),
  email: requiredString().email({ message: FieldErrorMessage.emailNotValid }),
  townCode: requiredString().length(5, FieldErrorMessage.townCodeNotValid),
});

export const companyInfoResolver = zodResolver(companyInfoValidator);
