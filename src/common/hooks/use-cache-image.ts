import { downloadAndCacheImage, getFileUrl } from '@/common/utils';
import { FileType } from '@bpartners/typescript-client';
import { useCallback, useState } from 'react';

export const useCacheImage = () => {
  const [isCaching, setIsCaching] = useState(false);

  const cacheImage = useCallback(async (fileId: string, fileType: FileType) => {
    const fileUrl = getFileUrl(fileId, fileType);
    setIsCaching(true);
    try {
      return await downloadAndCacheImage(fileId, fileUrl);
    } finally {
      setIsCaching(false);
    }
  }, []);

  return { isCaching, cacheImage };
};
