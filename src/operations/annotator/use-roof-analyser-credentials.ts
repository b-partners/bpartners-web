import { awsAuth, getCached } from '@/providers';
import { useEffect, useState } from 'react';

/**
 * The library's one credential since 0.17.0: the signed-in Cognito token, sent as `Authorization: Bearer`
 * on every call it makes — the records as much as the bridges (geocoder, imagery tiles, roof detection,
 * 3D and the report), all of them now the Dashboard API's own (`apiUrl`). The account's api key is no
 * longer resolved here: `apiKey` is only for a host with no session, and the library would exchange it at
 * `POST /token` for a bridge token rather than carry it.
 *
 * `bp_access_token` is the id token this app caches at login — the same one `wms-resolver.ts` signed the
 * imagery calls with before the library took them over. A live Amplify session is read back only when the
 * cache is empty.
 */
const readSessionToken = async () => {
  const cachedToken = getCached.token().accessToken;
  if (cachedToken) return cachedToken;
  const session = await awsAuth.fetchAuthSession();
  const token = session?.tokens?.idToken?.toString();
  if (!token) throw new Error('Aucun jeton de session — reconnectez-vous.');
  return token;
};

export const useRoofAnalyserCredentials = () => {
  const [accessToken, setAccessToken] = useState(getCached.token().accessToken ?? '');
  const [error, setError] = useState<Error>();
  const { accountId, accountHolderId, userId } = getCached.userInfo();

  useEffect(() => {
    if (accessToken) return;
    readSessionToken().then(setAccessToken).catch(setError);
  }, [accessToken]);

  return { accessToken, accountId, accountHolderId, userId, error };
};
