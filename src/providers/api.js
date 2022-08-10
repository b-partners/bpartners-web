import { UsersApi, PayingApi } from '../gen/haClient/api.ts';
import authProvider from './authProvider.ts';

export const usersApi = () => new UsersApi(authProvider.getCachedAuthConf());
export const payingApi = () => new PayingApi(authProvider.getCachedAuthConf());
