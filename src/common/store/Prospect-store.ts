import { FC, createContext, useContext, useState } from "react";

type RaProspectContext = {
  loading: boolean;
  handleLoading: (isLoading: boolean) => void;
};

const ProspectContext = createContext<RaProspectContext>({
  loading: false,
  handleLoading: () => {},
});
export const useProspectContext = () => useContext(ProspectContext);


 const ProspectContextProvider: FC = ({children}) =>{
   const [loading, setLoading] = useState(false);

   const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };

   return <ProspectContext.Provider value={{ loading, handleLoading }}>{children}</ProspectContext.Provider>
}
