import { useEffect, useState } from 'react';

export const useCheckAuth = (fetcher: () => Promise<any>) => {
  const [isLoading, setLoading] = useState(true);
  const [isAuthenticated, setAuthentication] = useState(false);

  useEffect(() => {
    fetcher()
      .then(() => setAuthentication(true))
      .catch(err => {
        setAuthentication(false);
        console.log(err);
      })
      .finally(() => setLoading(false));
  }, [fetcher]);

  return { isLoading, isAuthenticated };
};
