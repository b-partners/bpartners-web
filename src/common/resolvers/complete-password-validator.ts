import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import { FieldErrorMessage, requiredString } from './utils';

export const matchCognitoPassword = (password: string) => {
  const format = /[!@#$%^&*()_+\-=]/;
  const isIncorrect = password.length < 8 || !format.test(password) || !/\d/.test(password) || !/[A-Z]/.test(password);
  return !isIncorrect;
};

export const comparePasswords = ({ newPassword, confirmedPassword }: any) => newPassword === confirmedPassword;

const completePasswordValidator = zod
  .object({
    phoneNumber: requiredString()
      .refine(value => value.length === 10, { message: FieldErrorMessage.phoneLength })
      .transform(phone => `+33${phone.slice(1)}`),
    newPassword: requiredString().min(8, { message: FieldErrorMessage.minPassword }).refine(matchCognitoPassword, { message: FieldErrorMessage.badPassword }),
    confirmedPassword: requiredString(),
  })
  .refine(comparePasswords, { message: FieldErrorMessage.notMatchingPassword, path: ['confirmedPassword'] });

export const completePasswordResolver = zodResolver(completePasswordValidator);
