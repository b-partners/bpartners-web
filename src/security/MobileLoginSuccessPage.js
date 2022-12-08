import { useEffect } from 'react';
import { getUrlParams } from '../utils/getParams';
import { useNavigate } from 'react-router-dom';

const MobileLoginSuccessPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    async function login() {
      window.location.assign(`bpartners://auth${window.location.search}`);
    }

    login();
  }, []);

  return <p>Vous êtes authentifié ! Vous allez être redirigé bpartners://auth{window.location.search}...</p>;
};

export default MobileLoginSuccessPage;
