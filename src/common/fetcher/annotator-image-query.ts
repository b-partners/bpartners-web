import { FileApi, getCached } from '@/providers';
import { FileType } from '@bpartners/typescript-client';
import { useMutation } from '@tanstack/react-query';
import { base64ToFile } from '../utils';

interface MutationParams {
  id: string;
  file: string;
}

const mutationFn = async (params: MutationParams) => {
  const arrayBuffer = base64ToFile(params.file, params.id + '.png');
  const { accountId } = getCached.userInfo();
  return FileApi()
    .uploadFile(accountId, params.id, arrayBuffer, FileType.AREA_PICTURE, { headers: { 'Content-Type': 'image/png' } })
    .then(({ data }) => [data]);
};

export const useAnnotatorImageUploadQuery = () => useMutation({ mutationFn });
