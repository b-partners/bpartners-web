import { useEffect, useState } from 'react';

export const useCheckAuth = (fetcher: () => Promise<any>) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setAuthentication] = useState(false);

  useEffect(() => {
    fetcher()
      .then(() => setAuthentication(true))
      .catch(err => {
        setAuthentication(false);
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, [fetcher]);

  return { isLoading, isAuthenticated };
};
