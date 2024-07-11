import { CreateEmail } from '@bpartners/typescript-client';
import { getCached, mailingApi } from '.';

export const mailingProvider = {
  getList(_page: number, _perPage: number, _filters: any) {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: async (createEmail: CreateEmail[]) => {
    const { userId } = getCached.userInfo();
    return (await mailingApi().editOrSendEmails(userId, createEmail)).data;
  },
};
