import { zodResolver } from '@hookform/resolvers/zod';
import zod from 'zod';

export const SIREN_ERROR_MESSAGE = 'Le SIREN doit être composé de 9 chiffres.';

const sirenValidator = zod.object({
  siren: zod
    .string()
    .trim()
    .regex(/^\d{9}$/, { message: SIREN_ERROR_MESSAGE }),
});

export const sirenResolver = zodResolver(sirenValidator);
