import { useEffect, useState } from 'react';
import authProvider from 'src/providers/auth-provider';

/**
 * function that check is the user is authenticated or not (react admin has the same function but it seems not work)
 *
 */
const useAuthentication = () => {
  const [{ isLoading, isAuthenticated }, setState] = useState({ isLoading: true, isAuthenticated: false });

  useEffect(() => {
    setState({ isLoading: true, isAuthenticated: false });
    authProvider
      .checkAuth()
      .then(() => {
        setState({ isLoading: false, isAuthenticated: true });
      })
      .catch(() => {
        authProvider.logout();
        setState({ isLoading: false, isAuthenticated: false });
      });
  }, []);

  return { isLoading, isAuthenticated };
};

export default useAuthentication;
