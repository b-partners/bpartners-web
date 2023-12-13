import { CreateEmail } from 'bpartners-react-client';
import { getCached, mailingApi } from '.';

export const mailingProvider = {
  getList(page: number, perPage: number, filters: any) {
    throw new Error('Function not implemented.');
  },
  saveOrUpdate: async (createEmail: CreateEmail[]) => {
    const { userId } = getCached.userInfo();
    return (await mailingApi().editOrSendEmails(userId, createEmail)).data;
  },
};
