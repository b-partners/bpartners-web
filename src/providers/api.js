import { CustomersApi, FilesApi, PayingApi, ProspectingApi, SecurityApi, UserAccountsApi } from '../gen/bpClient';
import { CustomFilesApi } from '../gen/bpClient/apis/custom-files-api';
import authProvider from './auth-provider';

export const securityApi = () => new SecurityApi(authProvider.getCachedAuthConf());
export const userAccountsApi = () => new UserAccountsApi(authProvider.getCachedAuthConf());
export const payingApi = () => new PayingApi(authProvider.getCachedAuthConf());
export const customerApi = () => new CustomersApi(authProvider.getCachedAuthConf());
export const FileApi = () => new FilesApi(authProvider.getCachedAuthConf());
export const prospectingApi = () => new ProspectingApi(authProvider.getCachedAuthConf());
export const customFileApi = () => new CustomFilesApi(authProvider.getCachedAuthConf());
