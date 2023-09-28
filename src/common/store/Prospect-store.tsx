import { Dispatch, FC, createContext, useContext, useState } from "react";

type RaProspectContext = {
  loading: boolean;
  handleLoading: (isLoading: boolean) => void;
  selectedStatus: string;
  setSelectedStatus: Dispatch<React.SetStateAction<string>>; 
};

const ProspectContext = createContext<RaProspectContext>({
  loading: false,
  handleLoading: () => {},
  selectedStatus: '',
  setSelectedStatus: ()=> {}
});
export const useProspectContext = () => useContext(ProspectContext);


export const ProspectContextProvider: FC = ({children}) =>{
   const [loading, setLoading] = useState(false);
   const [selectedStatus, setSelectedStatus] = useState('');

   const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };

   return <ProspectContext.Provider value={{ loading, handleLoading, selectedStatus, setSelectedStatus }}>{children}</ProspectContext.Provider>
}
