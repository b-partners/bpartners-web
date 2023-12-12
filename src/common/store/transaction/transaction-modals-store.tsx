import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DataProps {
    from: Date;
    to: Date;
    downloadLink: string
}
interface ModalContextProps {
  dataForm: DataProps;
  setDataGenerateLinkFrom: (data: DataProps) => void;
  isExportLinkMailModalOpen: boolean;
  handleExpLinkMailModal: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [dataForm, setDataForm] = useState<DataProps>();
  const [isExportLinkMailModalOpen, setIsExportLinkMailModalOpen] = useState(false);
  
  const setDataGenerateLinkFrom = (data: DataProps) => {
    setDataForm(data);
  };
  const handleExpLinkMailModal = ()=> setIsExportLinkMailModalOpen(!isExportLinkMailModalOpen);

  return (
    <ModalContext.Provider value={{ dataForm, setDataGenerateLinkFrom, isExportLinkMailModalOpen, handleExpLinkMailModal }}>
      {children}
    </ModalContext.Provider>
  );
};

const useModalContext = () => {
  return useContext(ModalContext);
};

export { ModalProvider, useModalContext };
