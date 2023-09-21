import { zodResolver } from '@hookform/resolvers/zod';
import zod from 'zod';
import { FieldErrorMessage, emailValidator, requiredString } from './utils';

const calendarValidator = zod.object({
  title: requiredString(),
  start: requiredString(),
  end: requiredString(),
  organizer: zod.custom(() => true),
  id: zod.custom(() => true),
  location: zod.custom(() => true),
  participants: zod.custom(() => true),
});

export const calendarResolver = zodResolver(calendarValidator);

export const participantValidator = (value: string) => {
  const isValid = emailValidator.safeParse(value);
  return {
    error: !isValid.success,
    message: FieldErrorMessage.emailNotValid,
  };
};
