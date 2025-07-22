import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FieldErrorMessage, requiredNumberRows, requiredString } from '../resolvers';

const schema = z.object({
  name: requiredString(),
  businessActivities: z.object({
    primary: requiredString(),
    secondary: requiredString(),
  }),
  revenueTargets: z.object({
    amountAttempted: requiredNumberRows(),
  }),
  contactAddress: z.object({
    postalCode: requiredString().refine(value => value.length === 5, FieldErrorMessage.postalCodeNotValid),
    city: requiredString(),
    country: requiredString(),
    address: requiredString(),
  }),
  companyInfo: z.object({
    townCode: requiredString().refine(value => value.length === 5, FieldErrorMessage.townCodeNotValid),
    tvaNumber: requiredNumberRows(),
    socialCapital: requiredNumberRows(),
    website: z.string(),
  }),
  officialActivityName: requiredString(),
  siren: requiredNumberRows(),
});

type AccountFormType = z.infer<typeof schema>;

export const useAccountForm = (defaultValues?: AccountFormType) => {
  return useForm<AccountFormType>({ mode: 'all', resolver: zodResolver(schema), defaultValues });
};
