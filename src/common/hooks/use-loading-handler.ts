import { useState } from 'react';

export const useLoadingHandler = (defaultValue = false) => {
  const [isLoading, setIsLoading] = useState(defaultValue);
  return {
    isLoading,
    setIsLoading,
    handleLoading: (value: boolean) => {
      setIsLoading(value);
    },
    stopLoading: () => {
      setIsLoading(false);
    },
    startLoading: () => {
      setIsLoading(true);
    },
  };
};
