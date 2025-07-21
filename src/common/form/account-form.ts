import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { requiredString } from '../resolvers';

const schema = z.object({
  name: requiredString(),
  businessActivities: z.object({
    primary: requiredString(),
    secondary: requiredString(),
  }),
});

type AccountFormType = z.infer<typeof schema>;

export const useAccountForm = (defaultValues?: AccountFormType) => {
  return useForm<AccountFormType>({ mode: 'all', resolver: zodResolver(schema), defaultValues });
};
