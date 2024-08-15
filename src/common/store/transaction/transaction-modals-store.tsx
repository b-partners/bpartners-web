import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

interface DataProps {
  from: Date;
  to: Date;
  downloadLink: string;
}
interface ModalContextProps {
  dataForm: DataProps;
  setDataGenerateLinkFrom: (data: DataProps) => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [dataForm, setDataForm] = useState<DataProps>();

  const setDataGenerateLinkFrom = (data: DataProps) => {
    setDataForm(data);
  };

  const contextValues = useMemo(() => ({ dataForm, setDataGenerateLinkFrom }), [dataForm, setDataGenerateLinkFrom]);

  return <ModalContext.Provider value={contextValues}>{children}</ModalContext.Provider>;
};

const useModalContext = () => {
  return useContext(ModalContext);
};

export { ModalProvider, useModalContext };
