import {
  CustomersApi,
  FilesApi,
  OnboardingApi,
  PayingApi,
  ProspectingApi,
  SecurityApi,
  UserAccountsApi
} from '../gen/bpClient'
import authProvider from './auth-provider'

export const securityApi = () => new SecurityApi(authProvider.getCachedAuthConf())
export const userAccountsApi = () => new UserAccountsApi(authProvider.getCachedAuthConf())
export const payingApi = () => new PayingApi(authProvider.getCachedAuthConf())
export const customerApi = () => new CustomersApi(authProvider.getCachedAuthConf())
export const FileApi = () => new FilesApi(authProvider.getCachedAuthConf())
export const prospectingApi = () => new ProspectingApi(authProvider.getCachedAuthConf())
export const onboardingApi = () => new OnboardingApi(authProvider.getCachedAuthConf())
