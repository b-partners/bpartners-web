import { zodResolver } from '@hookform/resolvers/zod';
import zod from 'zod';
import { matchCognitoPassword } from './complete-password-validator';
import { FieldErrorMessage, requiredString } from './utils';

const comparePasswords = ({ newPassword, confirmedPassword }: any) => newPassword === confirmedPassword;

const PasswordValidator = zod
  .object({
    resetCode: requiredString(),
    newPassword: zod
      .string({ required_error: FieldErrorMessage.emptyPassword })
      .min(8, { message: FieldErrorMessage.minPassword })
      .refine(matchCognitoPassword, { message: FieldErrorMessage.badPassword }),
    confirmedPassword: requiredString(),
  })
  .refine(comparePasswords, { message: FieldErrorMessage.notMatchingPassword, path: ['confirmedPassword'] });

export const PasswordResolver = zodResolver(PasswordValidator);
