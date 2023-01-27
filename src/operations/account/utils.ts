import { CompanyBusinessActivity, CompanyInfo } from 'bpartners-react-client';
import { toMajors } from '../utils/money';

export const ACTIVITY_TOOLTIP_TITLE = "Sélectionnez votre métier dans la liste. S'il n'y figure pas, écrivez-le directement dans le champ de saisie.";

// BusinessActivities default values
type BusinessActiVitiesValues = { new: CompanyBusinessActivity; current: CompanyBusinessActivity };
export const businessActivityDefaultValues: BusinessActiVitiesValues = {
  new: { primary: null, secondary: null },
  current: { primary: null, secondary: null },
};

// check if the current business activity is equal to the business activity in the autocomplete input
export const shouldSaveButtonDisable = (currentActivities: CompanyBusinessActivity, newActivities: CompanyBusinessActivity) => {
  if (currentActivities && newActivities) {
    const isBlank = isObjectElementsBlank(currentActivities) || isObjectElementsBlank(newActivities);
    return isBlank || (currentActivities.primary === newActivities.primary && currentActivities.secondary === newActivities.secondary);
  }
  return true;
};

const isObjectElementsBlank = (obj: Object): boolean => {
  Object.keys(obj).forEach(e => {
    if (!e || e.length === 0) {
      return true;
    }
  });
  return false;
};

export const ACCOUNT_HOLDER_LAYOUT = {
  CONFIGURATION: 'configuration',
  VIEW: 'view',
};

export const phoneValidator = (phoneNumber: string) => {
  if (!phoneNumber || phoneNumber.length === 0) {
    return 'Ce champ est requis';
  } else if (/[^0-9+]/.test(phoneNumber)) {
    return 'Le numéro de téléphone ne doit contenir que des chiffres est un signe +';
  } else if (!/\+[0-9]/.test(phoneNumber)) {
    return 'Format de numéro incorrecte, format correcte: "+[code pays][numéro]"';
  }
  return true;
};

/**
 * Check if two companyInfo are the same
 * @param currentCompanyInfo
 * @param newCompanyInfo
 * @returns true is two companyInfo are same, else false
 */
export const companyInfoDiff = (currentCompanyInfo: CompanyInfo, newCompanyInfo: CompanyInfo) => {
  if (
    currentCompanyInfo.email !== newCompanyInfo.email ||
    currentCompanyInfo.phone !== newCompanyInfo.phone ||
    toMajors(currentCompanyInfo.socialCapital) !== +newCompanyInfo.socialCapital
  ) {
    return false;
  }
  return true;
};
