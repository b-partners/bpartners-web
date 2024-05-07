import { zodResolver } from '@hookform/resolvers/zod';
import zod from 'zod';
import { requiredString } from './utils';

const generalInfoValidator = zod.object({
  name: requiredString(),
  siren: requiredString(),
  officialActivityName: requiredString(),
  initialCashflow: requiredString(),
  address: requiredString(),
  city: requiredString(),
  country: requiredString(),
  postalCode: requiredString(),
});

export const generalInfoResolver = zodResolver(generalInfoValidator);
