import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FieldErrorMessage, phoneValidator, requiredNumberRows, requiredString, requiredStringCustom } from '../resolvers';

const schema = z.object({
  name: requiredString(),
  businessActivities: z.object({
    primary: requiredString(),
    secondary: requiredString(),
  }),
  revenueTargets: z.array(z.object({
    amountTarget: z.custom(() => true) .transform((value) => Number(value)),
    year: z.custom(() => true),
  })),
  contactAddress: z.object({
    postalCode: requiredString().refine(value => value.length === 5, FieldErrorMessage.postalCodeNotValid),
    city: requiredString(),
    country: requiredString(),
    address: requiredString(),
    prospectingPerimeter: z.custom(() => true),
  }),
  companyInfo: z.object({
    townCode: requiredString().refine(value => value.length === 5, FieldErrorMessage.townCodeNotValid),
    tvaNumber: requiredStringCustom(),
    socialCapital: requiredStringCustom(),
    website: z.string(),
    phone: requiredString().refine(phoneValidator, FieldErrorMessage.accountPhone),
    email: z.string().min(1, FieldErrorMessage.required).email({ message: FieldErrorMessage.emailNotValid }),
  }),
  officialActivityName: requiredString(),
  siren: requiredString(),
  initialCashFlow: requiredNumberRows(),
  feedback: z.object({
    feedbackLink: requiredString(),
  })
});

type AccountFormType = z.infer<typeof schema>;

export const useAccountForm = (defaultValues?: AccountFormType) => {
  return useForm<AccountFormType>({ mode: 'all', resolver: zodResolver(schema), defaultValues });
};
