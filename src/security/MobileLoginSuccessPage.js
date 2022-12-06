import { useEffect } from 'react';
import { getUrlParams } from '../utils/getParams';
import { useNavigate } from 'react-router-dom';

const MobileLoginSuccessPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    async function login() {
      const code = getUrlParams(window.location.search, 'code');
      window.location.assign(`${process.env.REACT_APP_MOBILE_REDIRECTION_URL}?code=${code}`);
    }

    login();
  }, []);

  return <p>Vous êtes authentifié ! Vous allez être redirigé vers votre espace professionel...</p>;
};

export default MobileLoginSuccessPage;
