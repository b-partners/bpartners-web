import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FieldErrorMessage, phoneValidator, requiredStringCustom } from '../resolvers';
import { toMinors } from '../utils';

const schema = z.object({
  name: requiredStringCustom(),
  businessActivities: z.object({
    primary: requiredStringCustom(),
    secondary: requiredStringCustom(),
  }),
  revenueTargets: z.array(
    z.object({
      amountTarget: z.custom(() => true).transform(value => toMinors(Number(value))),
      year: z.custom(() => true),
    })
  ),
  contactAddress: z.object({
    postalCode: requiredStringCustom().refine(value => value.length === 5, { message: FieldErrorMessage.postalCodeNotValid }),
    city: requiredStringCustom(),
    country: requiredStringCustom(),
    address: requiredStringCustom(),
    prospectingPerimeter: z.custom(() => true),
  }),
  companyInfo: z.object({
    townCode: requiredStringCustom().refine(value => value.length === 5, { message: FieldErrorMessage.townCodeNotValid }),
    tvaNumber: requiredStringCustom(),
    socialCapital: requiredStringCustom().transform(value => toMinors(Number(value))),
    website: z.string(),
    phone: requiredStringCustom().refine(phoneValidator, FieldErrorMessage.accountPhone),
    email: z.string().min(1, FieldErrorMessage.required).email({ message: FieldErrorMessage.emailNotValid }),
  }),
  officialActivityName: requiredStringCustom(),
  siren: requiredStringCustom(),
  initialCashFlow: requiredStringCustom().transform(value => toMinors(Number(value))),
  feedback: z.object({
    feedbackLink: requiredStringCustom(),
  }),
});

type AccountFormType = z.infer<typeof schema>;

export const useAccountForm = (defaultValues?: AccountFormType) => {
  return useForm<AccountFormType>({ mode: 'all', resolver: zodResolver(schema), defaultValues });
};
