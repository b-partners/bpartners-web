import zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldErrorMessage, requiredString } from './utils';

const matchCognitoPassword = (password: string) => {
  const format = /[!@#$%^&*()_+\-=]/;
  if (password.length < 8) {
    return false;
  } else if (!format.test(password)) {
    return false;
  } else if (!/\d/.test(password)) {
    return false;
  } else if (!/[A-Z]/.test(password)) {
    return false;
  }
  return true;
};

const comparePasswords = ({ newPassword, confirmedPassword }: any) => newPassword === confirmedPassword;

const completePasswordValidator = zod
  .object({
    phoneNumber: requiredString()
      .refine(value => value.length === 10, { message: FieldErrorMessage.phoneLength })
      .transform(phone => `+33${phone.slice(1)}`),
    newPassword: zod
      .string({ required_error: FieldErrorMessage.emptyPassword })
      .nonempty({ message: FieldErrorMessage.emptyPassword })
      .min(8, { message: FieldErrorMessage.minPassword })
      .refine(matchCognitoPassword, { message: FieldErrorMessage.badPassword }),
    confirmedPassword: requiredString(),
  })
  .refine(comparePasswords, { message: FieldErrorMessage.notMatchingPassword, path: ['confirmedPassword'] });

export const completePasswordResolver = zodResolver(completePasswordValidator);
