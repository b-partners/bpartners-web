import zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldErrorMessage, requiredNumberRows, requiredRating, requiredString, requiredArray } from './utils';

const prospectConfigValidator = zod.object({
  // artisanOwner: requiredString(),
  profession: requiredString(),
  infestationType: requiredString(),
  // newInterventionOption : requiredString(),
  spreadsheetName: requiredString(),
  sheetName: requiredString(),
  max: requiredNumberRows(),
  min: requiredNumberRows(),
  minCustomerRating: requiredRating().refine(value => value <= 10, { message: FieldErrorMessage.maxRatingNotValid }),
  minProspectRating: requiredRating().refine(value => value <= 10, { message: FieldErrorMessage.maxRatingNotValid }),
  interventionTypes: requiredArray(),
});

const importProspectsValidator = zod.object({
  import_spreadsheetName: requiredString(),
  import_sheetName: requiredString(),
  import_max: requiredNumberRows(),
  import_min: requiredNumberRows(),
});

export const prospectConfigResolver = zodResolver(prospectConfigValidator);
export const importProspectsResolver = zodResolver(importProspectsValidator);
