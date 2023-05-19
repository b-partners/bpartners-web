import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authProvider, getCached } from 'src/providers';

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
            .catch(err => console.error(err))
            .finally(() => setState(false));
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return { isLoading };
};

export default useAuthentication;
