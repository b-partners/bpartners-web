import { accountHoldersGetter, singleAccountGetter } from './account-provider';
import authProvider from './auth-provider';

export const getUserInfo = async (): Promise<{ accountId: string; userId: string; accountHId: string }> => {
  const user = authProvider.getCachedWhoami().user;
  const account = await singleAccountGetter(user.id);
  const accountHolder = await accountHoldersGetter();

  return { userId: user.id, accountId: account.id, accountHId: accountHolder.id };
};
