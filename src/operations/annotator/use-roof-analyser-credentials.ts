import { getApiKey, getCached } from '@/providers';
import { useEffect, useState } from 'react';

export const useRoofAnalyserCredentials = () => {
  const [apiKey, setApiKey] = useState(getCached.apiKey() ?? '');
  const { accountId, accountHolderId, userId } = getCached.userInfo();

  useEffect(() => {
    if (apiKey) return;
    getApiKey().then(key => setApiKey(key ?? ''));
  }, [apiKey]);

  return { apiKey, accountId, accountHolderId, userId };
};
