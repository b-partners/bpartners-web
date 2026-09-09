import { getApiKey, getCached } from '@/providers';
import { useEffect, useState } from 'react';

export const useRoofAnalyserCredentials = () => {
  const [apiKey, setApiKey] = useState(getCached.apiKey() ?? '');
  const [error, setError] = useState<Error>();
  const { accountId, accountHolderId, userId } = getCached.userInfo();

  useEffect(() => {
    if (apiKey) return;
    getApiKey()
      .then(key => setApiKey(key ?? ''))
      .catch(setError);
  }, [apiKey]);

  return { apiKey, accountId, accountHolderId, userId, error };
};
