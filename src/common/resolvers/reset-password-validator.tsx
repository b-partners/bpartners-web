import { zodResolver } from '@hookform/resolvers/zod';
import zod from 'zod';
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

const PasswordValidator = zod
  .object({
    resetCode: requiredString(),
    newPassword: zod
      .string({ required_error: FieldErrorMessage.emptyPassword })
      .nonempty({ message: FieldErrorMessage.emptyPassword })
      .min(8, { message: FieldErrorMessage.minPassword })
      .refine(matchCognitoPassword, { message: FieldErrorMessage.badPassword }),
    confirmedPassword: requiredString(),
  })
  .refine(comparePasswords, { message: FieldErrorMessage.notMatchingPassword, path: ['confirmedPassword'] });

export const PasswordResolver = zodResolver(PasswordValidator);
