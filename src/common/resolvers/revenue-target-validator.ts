import { zodResolver } from '@hookform/resolvers/zod';
import zod from 'zod';
import { requiredString } from './utils';

const revenueTargetValidator = zod.object({
  amountTarget: requiredString(),
});

export const revenueTargetResolver = zodResolver(revenueTargetValidator);
