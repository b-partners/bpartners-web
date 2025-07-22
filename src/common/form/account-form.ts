import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { requiredNumberRows, requiredString } from '../resolvers';

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
    postalCode: requiredNumberRows(), //??? Je sais pas quoi mettre
    city: requiredString(),
    country: requiredString(),
    address: requiredString(), // ??? Je sais pas quoi mettre
  }),
  companyInfo: z.object({
    townCode: requiredNumberRows(), //??? Je sais pas quoi mettre
    tvaNumber: requiredNumberRows(), //??? Je sais pas si c'est le bon
    socialCapital: requiredNumberRows(), //??? Je sais pas si c'est le bon
    website: requiredString(), //??? Je sais pas quoi mettre
  }),
  officialActivityName: requiredString(),
  siren: requiredNumberRows(), //??? Je sais pas si c'est le bon
});

type AccountFormType = z.infer<typeof schema>;

export const useAccountForm = (defaultValues?: AccountFormType) => {
  return useForm<AccountFormType>({ mode: 'all', resolver: zodResolver(schema), defaultValues });
};
