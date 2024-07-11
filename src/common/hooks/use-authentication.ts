import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authProvider, getCached } from '@/providers';
import { printError } from '../utils';

/**
 * function that check is the user is authenticated or not (react admin has the same function but it seems not work)
 *
 */
const useAuthentication = () => {
  const [isLoading, setState] = useState(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const { accessToken } = getCached.token();
    if (accessToken) {
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
          authProvider
            .logout()
            .catch(printError)
            .finally(() => setState(false));
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return { isLoading };
};

export default useAuthentication;
