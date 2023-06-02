import { FeedbackRequest } from 'bpartners-react-client';
import { userAccountsApi } from './api';
import { asyncGetUserInfo } from './asyncGetUserInfo';

export const feedbackProvider = {
  async ask(resource: FeedbackRequest) {
    const { accountHolderId, userId } = await asyncGetUserInfo();
    const { data } = await userAccountsApi().askFeedback(userId, accountHolderId, resource);
    return data;
  },
};
