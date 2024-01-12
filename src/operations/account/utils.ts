import { AccountHolder, CompanyBusinessActivity, CompanyInfo } from '@bpartners/typescript-client';
import { toMajors } from '../../common/utils';

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

export const phoneValidator = (phoneNumber: string): any => {
  if (!phoneNumber || phoneNumber.length === 0) {
    return 'Ce champ est requis';
  } else if (/[^0-9+]/.test(phoneNumber)) {
    return 'Le numéro de téléphone ne doit contenir que des chiffres';
  }
  return true;
};

export const townCodeValidator = (townCode: number): any => {
  if (townCode && `${townCode}`.length !== 5) {
    return 'Le code de la commune de prospection doit être à 5 chiffres.';
  }
  return true;
};

/**
 * Check if two companyInfo are the same
 * @param currentCompanyInfo
 * @param newCompanyInfo
 * @returns true is two companyInfo are same, else false
 */
export const companyInfoDiff = (currentCompanyInfo = {} as CompanyInfo, newCompanyInfo = {} as CompanyInfo) => {
  return !(
    currentCompanyInfo.email !== newCompanyInfo.email ||
    currentCompanyInfo.website !== newCompanyInfo.website ||
    currentCompanyInfo.phone !== newCompanyInfo.phone ||
    currentCompanyInfo.townCode !== newCompanyInfo.townCode ||
    currentCompanyInfo.tvaNumber !== newCompanyInfo.tvaNumber ||
    toMajors(currentCompanyInfo.socialCapital) !== +newCompanyInfo.socialCapital
  );
};

export const generalInfoDiff = (currentAccountHolder: AccountHolder, newGeneralInfo: any) => {
  const { name, siren, initialCashflow, officialActivityName, contactAddress } = currentAccountHolder;
  const { address, city, country, postalCode } = contactAddress || {};
  return !(
    newGeneralInfo.name !== name ||
    newGeneralInfo.siren !== siren ||
    +newGeneralInfo.initialCashflow !== toMajors(initialCashflow) ||
    newGeneralInfo.officialActivityName !== officialActivityName ||
    newGeneralInfo.address !== address ||
    newGeneralInfo.city !== city ||
    newGeneralInfo.country !== country ||
    newGeneralInfo.postalCode !== postalCode
  );
};
