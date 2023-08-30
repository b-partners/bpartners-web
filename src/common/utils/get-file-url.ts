import { FileType } from 'bpartners-react-client';
import { getCached } from 'src/providers';

export const getFileUrl = (id: string, type: FileType) => {
  const { accountId } = getCached.userInfo();
  const { accessToken } = getCached.token();
  return `${process.env.REACT_APP_BPARTNERS_API_URL}/accounts/${accountId}/files/${id}/raw?accessToken=${accessToken}&fileType=${type}`;
};
