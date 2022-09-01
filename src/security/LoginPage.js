import { useLogin } from 'react-admin';
import { useEffect } from 'react';

const BpLoginPage = () => {
  const login = useLogin();

  useEffect(() => {
    login();
  });

  return <p>C'est bien ici qu'on récupère les informations de connexion alors TODO</p>;
};

export default BpLoginPage;
