import { createContext, Dispatch, FC, ReactNode, useContext, useMemo } from 'react';

type RaProspectContext = {
  children?: ReactNode;
  loading: boolean;
  setLoading: Dispatch<React.SetStateAction<boolean>>;
};

const ProspectContext = createContext<RaProspectContext>({
  loading: false,
  setLoading: () => {},
});
export const useProspectContext = () => useContext(ProspectContext);

export const ProspectContextProvider: FC<RaProspectContext> = ({ children, loading, setLoading }) => {
  const contextValues = useMemo(
    () => ({
      loading,
      setLoading,
    }),
    [loading, setLoading]
  );

  return <ProspectContext.Provider value={contextValues}>{children}</ProspectContext.Provider>;
};
