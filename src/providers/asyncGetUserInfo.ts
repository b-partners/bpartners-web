import { accountHolderProvider } from './account-holder-Provider';
import { accountProvider, getCached, profileProvider } from '.';

export const asyncGetUserInfo = async () => {
  const { accountHolderId, accountId, userId } = getCached.userInfo();
  const res = { accountHolderId, accountId, userId };
  if (!accountId) {
    res.accountId = (await accountProvider.getOne()).id;
  }
  if (!accountHolderId) {
    res.accountHolderId = (await accountHolderProvider.getOne()).id;
  }
  return res;
};

export const asyncGetAccountId = async () => {
  const { accountId } = getCached.userInfo();
  return accountId ? accountId : ((await accountProvider.getOne()).id as string);
};

export const asyncGetUser = async () => {
  const user = getCached.user();
  return user && user.id ? getCached.user() : await profileProvider.getOne(getCached.whoami().user.id);
};
