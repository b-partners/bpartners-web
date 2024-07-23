import { useEffect } from 'react';
import { printError } from '@/common/utils';

const MobileLoginSuccessPage = () => {
  useEffect(() => {
    async function login() {
      window.location.assign(`bpartners://auth${window.location.search}`);
    }

    login().catch(printError);
  }, []);

  return <p>Vous êtes authentifié ! Vous allez être redirigé !</p>;
};

export default MobileLoginSuccessPage;
