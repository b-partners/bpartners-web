import zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldErrorMessage, phoneValidator, requiredString } from './utils';

const companyInfoValidator = zod.object({
  socialCapital: requiredString(),
  phone: requiredString().refine(phoneValidator, FieldErrorMessage.phone),
  email: zod.string().nonempty(FieldErrorMessage.required).email({ message: FieldErrorMessage.emailNotValid }),
  website: zod.custom(() => true),
  townCode: requiredString().refine(value => value.length === 5, FieldErrorMessage.townCodeNotValid),
  tvaNumber: requiredString(),
});

export const companyInfoResolver = zodResolver(companyInfoValidator);
