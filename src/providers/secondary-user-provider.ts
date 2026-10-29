import { SecondaryUser } from '@bpartners/typescript-client';
import { secondaryUserApi } from './api';
import { asyncGetUser } from './asyncGetUserInfo';

export const getSecondaryUserInvitations = async (): Promise<SecondaryUser[]> => {
  const { id } = await asyncGetUser();
  const { data } = await secondaryUserApi().getSecondaryUserInvitations(id);
  return Array.isArray(data) ? data : [];
};

export const acceptSecondaryUserInvitation = async (invitationId: string): Promise<SecondaryUser> => {
  const { id } = await asyncGetUser();
  const { data } = await secondaryUserApi().acceptSecondaryUserInvitation(id, invitationId);
  return data;
};
