import { CalendarApi, CustomersApi, FilesApi, OnboardingApi, PayingApi, ProspectingApi, SecurityApi, UserAccountsApi, SheetApi } from 'bpartners-react-client';
import { authProvider } from '.';

export const securityApi = () => new SecurityApi(authProvider.getCachedAuthConf());
export const userAccountsApi = () => new UserAccountsApi(authProvider.getCachedAuthConf());
export const payingApi = () => new PayingApi(authProvider.getCachedAuthConf());
export const customerApi = () => new CustomersApi(authProvider.getCachedAuthConf());
export const FileApi = () => new FilesApi(authProvider.getCachedAuthConf());
export const prospectingApi = () => new ProspectingApi(authProvider.getCachedAuthConf());
export const onboardingApi = () => new OnboardingApi(authProvider.getCachedAuthConf());
export const calendarApi = () => new CalendarApi(authProvider.getCachedAuthConf());
export const sheetApi = () => new SheetApi(authProvider.getCachedAuthConf());
