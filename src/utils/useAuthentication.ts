import { useEffect, useState } from 'react';
import authProvider from 'src/providers/auth-provider';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * function that check is the user is authenticated or not (react admin has the same function but it seems not work)
 *
 */
const useAuthentication = () => {
  const [isLoading, setState] = useState(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    setState(true);
    authProvider
      .checkAuth()
      .then(() => {
        if (/login/.test(pathname)) {
          navigate('/transactions');
        }
        setState(false);
      })
      .catch(() => {
        navigate('/login');
        authProvider.logout();
        setState(false);
      });
  }, [navigate]);

  return { isLoading };
};

export default useAuthentication;
