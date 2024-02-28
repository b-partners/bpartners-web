import { createContext, useContext } from 'react';

const CanvasAnnotationContext = createContext({});
export const useCanvasAnnotationContext = () => useContext(CanvasAnnotationContext);

export const CanvasAnnotationContextProvider = ({ children }: any) => {
  
  return (
    <CanvasAnnotationContext.Provider value={{}}>
      {children}
    </CanvasAnnotationContext.Provider>
  );
};
