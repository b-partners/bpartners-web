import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FieldErrorMessage, phoneValidator, requiredStringCustom } from '../resolvers';
import { toMinors } from '../utils';

const schema = z
  .object({
    name: requiredStringCustom(),
    businessActivities: z.object({
      primary: requiredStringCustom(),
      secondary: requiredStringCustom(),
    }),
    contactAddress: z.object({
      postalCode: requiredStringCustom().refine(value => value.length === 5, { message: FieldErrorMessage.postalCodeNotValid }),
      city: requiredStringCustom(),
      country: requiredStringCustom(),
      address: requiredStringCustom(),
      prospectingPerimeter: z.custom(() => true),
    }),
    companyInfo: z.object({
      tvaNumber: z.custom(() => true),
      socialCapital: z.custom(() => true),
      website: z.string(),
      phone: requiredStringCustom().refine(phoneValidator, FieldErrorMessage.accountPhone),
      email: z.string().min(1, FieldErrorMessage.required).email({ message: FieldErrorMessage.emailNotValid }),
      isSubjectToVat: z.boolean().optional(),
    }),
    officialActivityName: requiredStringCustom(),
    siren: z.custom(() => true),
    feedback: z.object({
      feedbackLink: requiredStringCustom(),
    }),
  })
  .transform(data => ({
    ...data,
    companyInfo: { ...data.companyInfo, socialCapital: toMinors(Number(data.companyInfo.socialCapital)) },
  }));

type AccountFormType = z.infer<typeof schema>;

export const useAccountForm = (defaultValues?: AccountFormType) => {
  return useForm<AccountFormType>({ mode: 'all', resolver: zodResolver(schema), defaultValues });
};
