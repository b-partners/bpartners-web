import { SecurityApi, UserAccountsApi, PayingApi, CustomersApi } from '../gen/bpClient';
import authProvider from './auth-provider';

export const securityApi = () => new SecurityApi(authProvider.getCachedAuthConf());
export const userAccountsApi = () => new UserAccountsApi(authProvider.getCachedAuthConf());
export const payingApi = () => new PayingApi(authProvider.getCachedAuthConf());
export const customerApi = () => new CustomersApi(authProvider.getCachedAuthConf());
