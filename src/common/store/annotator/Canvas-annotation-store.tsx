import { Polygon } from '@bpartners/annotator-component';
import { createContext, useContext, useState } from 'react';

type annotationStore ={
  setPolygons: (data: any)=> void;
  polygons: Polygon[];
  addNewPolygon: (newPolygon:Polygon)=> void;
}

const CanvasAnnotationContext = createContext<annotationStore>({polygons: [], setPolygons: ()=> {}, addNewPolygon: ()=>{}});
export const useCanvasAnnotationContext = () => useContext(CanvasAnnotationContext);

export const CanvasAnnotationContextProvider = ({ children }: any) => {
  const [polygons, setPolygons] = useState<Polygon[]>([]);

  const addNewPolygon = (newPolygon: Polygon)=>{
    setPolygons(prev=> [
      ...prev,
      newPolygon
    ])
  }
  
  
  return (
    <CanvasAnnotationContext.Provider value={{polygons, setPolygons, addNewPolygon}}>
      {children}
    </CanvasAnnotationContext.Provider>
  );
};
