import { awsAuth, getCached } from '@/providers';
import { useEffect, useState } from 'react';

// The Cognito id token this app caches under `bp_access_token` at login — what every call to the
// BPartners API is signed with. A live session is read back only when the cache is empty.
const sessionToken = async () => {
  const cachedToken = getCached.token().accessToken;
  if (cachedToken) return cachedToken;
  const session = await awsAuth.fetchAuthSession();
  return session?.tokens?.idToken?.toString() ?? '';
};

export const useRoofAnalyserCredentials = () => {
  const [accessToken, setAccessToken] = useState(getCached.token().accessToken ?? '');
  const [error, setError] = useState<Error>();
  const { accountId, accountHolderId, userId } = getCached.userInfo();

  useEffect(() => {
    if (accessToken) return;
    sessionToken()
      .then(token => setAccessToken(token ?? ''))
      .catch(setError);
  }, [accessToken]);

  return { accessToken, accountId, accountHolderId, userId, error };
};
