import {
  AreaPictureApi,
  CalendarApi,
  CustomersApi,
  FilesApi,
  MailingApi,
  OnboardingApi,
  PayingApi,
  ProspectingApi,
  SecurityApi,
  SheetApi,
  UserAccountsApi,
  UserSubscriptionApi,
} from '@bpartners/typescript-client';
import { configureApi } from './api-conf';

export const securityApi = configureApi(SecurityApi);
export const userAccountsApi = configureApi(UserAccountsApi);
export const payingApi = configureApi(PayingApi);
export const customerApi = configureApi(CustomersApi);
export const FileApi = configureApi(FilesApi);
export const prospectingApi = configureApi(ProspectingApi);
export const onboardingApi = configureApi(OnboardingApi);
export const calendarApi = configureApi(CalendarApi);
export const sheetApi = configureApi(SheetApi);
export const mailingApi = configureApi(MailingApi);
export const areaPictureApi = configureApi(AreaPictureApi);
export const userSubscriptionApi = configureApi(UserSubscriptionApi);
