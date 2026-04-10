import { accountProvider, getCached, profileProvider, whoami } from '.';
import { accountHolderProvider } from './account-holder-Provider';

export const asyncGetUserInfo = async () => {
  const { accountHolderId, accountId, userId } = getCached.userInfo();
  const cachedWhoami = getCached.whoami();
  const res = { accountHolderId, accountId, userId, cachedWhoami };

  if (!cachedWhoami) {
    res.cachedWhoami = await whoami();
  }
  if (!userId) {
    res.userId = res.cachedWhoami.user?.id;
  }
  if (!accountId) {
    res.accountId = (await accountProvider.getOne(res.userId))?.id;
  }
  if (!accountHolderId) {
    res.accountHolderId = (await accountHolderProvider.getOne())?.id;
  }
  return res;
};

export const asyncGetAccountId = async () => {
  const { accountId } = getCached.userInfo();
  return accountId ? accountId : ((await accountProvider.getOne())?.id as string);
};

export const asyncGetUser = async () => {
  const user = getCached.user();
  return user && user?.id ? getCached.user() : await profileProvider.getOne(getCached.whoami().user?.id);
};
