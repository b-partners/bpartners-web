import { FileType } from '@bpartners/typescript-client';
import { getCached } from '@/providers';

export const getFileUrl = (id: string, type: FileType) => {
  const { accountId } = getCached.userInfo();
  const { accessToken } = getCached.token();
  return `${process.env.REACT_APP_BPARTNERS_API_URL}/accounts/${accountId}/files/${id}/raw?accessToken=${accessToken}&fileType=${type}`;
};
