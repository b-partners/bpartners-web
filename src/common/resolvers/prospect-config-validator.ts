import zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldErrorMessage, requiredNumberRows, requiredRating, requiredString, requiredArray } from './utils';

const prospectConfigValidator = zod.object({
  // artisanOwner: requiredString(),
  profession: requiredString(),
  infestationType: requiredString(),
  // newInterventionOption : requiredString(),
  spreedSheetName: requiredString(),
  sheetName: requiredString(),
  max: requiredNumberRows(),
  min: requiredNumberRows(),
  minCustomerRating: requiredRating().refine(value => value <= 10, { message: FieldErrorMessage.maxRatingNotValid }),
  minProspectRating: requiredRating().refine(value => value <= 10, { message: FieldErrorMessage.maxRatingNotValid }),
  interventionTypes: requiredArray(),
});

export const prospectConfigResolver = zodResolver(prospectConfigValidator);
