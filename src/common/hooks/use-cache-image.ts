import { downloadAndCacheImage, getFileUrl, removeImageFromCache } from '@/common/utils';
import { FileType } from '@bpartners/typescript-client';
import { useCallback, useState } from 'react';

export const useCacheImage = () => {
  const [isCaching, setIsCaching] = useState(false);

  const cacheImage = useCallback(async (fileId: string, fileType: FileType, previousFileId?: string) => {
    setIsCaching(true);
    try {
      if (previousFileId) await removeImageFromCache(previousFileId);
      const fileUrl = getFileUrl(fileId, fileType);
      return await downloadAndCacheImage(fileId, fileUrl);
    } finally {
      setIsCaching(false);
    }
  }, []);

  return { isCaching, cacheImage, setIsCaching };
};
