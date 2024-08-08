import { zodResolver } from '@hookform/resolvers/zod';
import zod from 'zod';
import { FieldErrorMessage, phoneValidator, requiredStringCustom } from './utils';

const prospectInfoValidator = zod.object({
  email: zod.custom(
    value => {
      return (
        value === '' ||
        !value ||
        zod
          .string()
          .email()
          .safeParse(value as string).success
      );
    },
    { message: FieldErrorMessage.emailNotValid }
  ),
  phone: zod.custom(
    phoneNumber => {
      const phoneNumberWithoutSpaces = ((phoneNumber as string) || '').replace(/\s/g, '');
      return phoneNumber === '' || !phoneNumber || phoneValidator(phoneNumberWithoutSpaces);
    },
    { message: FieldErrorMessage.phone }
  ),
  address: requiredStringCustom(),
  comment: zod.custom(() => true),
  defaultComment: zod.custom(() => true),
  invoice: zod.custom(() => true),
  invoiceID: zod.custom(() => true),
  prospectFeedback: zod.custom(() => true),
  contractAmount: zod.custom(() => true),
  name: requiredStringCustom(),
  firstName: zod.custom(() => true),
  status: zod.custom(() => true),
});

export const prospectInfoResolver = zodResolver(prospectInfoValidator);
