import { useLogin } from 'react-admin';
import { useEffect } from 'react';

const BpLoginPage = () => {
  const login = useLogin();

  useEffect(() => {
    login();
  });

  return (
    <p>
      Merci de vous connecter sur <a href={process.env.REACT_APP_AUTH_URL || ''}>bpartners.app</a>
    </p>
  );
};

export default BpLoginPage;
