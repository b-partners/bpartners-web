import { useEffect } from 'react';

import authProvider from '../providers/auth-provider';
import loginRedirectionUrls from './login-redirection-urls';
import { redirect } from '../common/utils/redirect';
import { getUrlParams } from '../common/utils/get-params';

const LoginSuccessPage = () => {
  useEffect(() => {
    async function login() {
      const code = getUrlParams(window.location.search, 'code');
      await authProvider.login({ username: null, password: code, clientMetadata: { redirectionStatusUrls: loginRedirectionUrls } });
      redirect(window.location.origin);
    }
    login();
  }, []);

  return <p>Vous êtes authentifié ! Vous allez être redirigé vers votre espace professionel...</p>;
};

export default LoginSuccessPage;
