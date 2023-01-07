import { useEffect } from 'react';

const MobileLoginSuccessPage = () => {
  useEffect(() => {
    async function login() {
      window.location.assign(`bpartners://auth${window.location.search}`);
    }

    login();
  }, []);

  return <p>Vous êtes authentifié ! Vous allez être redirigé bpartners://auth{window.location.search}...</p>;
};

export default MobileLoginSuccessPage;
