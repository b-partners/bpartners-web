import zod, { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldErrorMessage } from './utils';

const validate = (value: string) => {
  if (value.includes(' ')) return false;
  else if (value.includes('.')) return true;
  return false;
};

const feedbackLinkValidator = zod.object({
  feedbackLink: z.string().refine(validate, { message: FieldErrorMessage.linkNotValid }),
});

export const feedbackLinkResolver = zodResolver(feedbackLinkValidator);
