import { useEffect, useState } from 'react';

export const useCheckAuth = (fetcher: () => Promise<any>) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetcher()
      .then(() => setIsAuthenticated(true))
      .catch(err => {
        setIsAuthenticated(false);
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, [fetcher]);

  return { isLoading, isAuthenticated };
};
