import zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldErrorMessage, requiredString, phoneValidator } from './utils';

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
  address: zod.custom(() => true),
  comment: zod.custom(() => true),
  prospectFeedback: zod.custom(() => true),
  contractAmount: zod.custom(() => true),
  name: zod.custom(() => true),
  status: requiredString(),
});

export const prospectInfoResolver = zodResolver(prospectInfoValidator);
export const emailSchema = zod.string().email();
