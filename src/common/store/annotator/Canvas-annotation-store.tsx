import { Polygon } from '@bpartners/annotator-component';
import { createContext, useContext, useState } from 'react';

type annotationStore = {
  setPolygons: (data: any) => void;
  polygons: Polygon[];
  updatePolygonList: (polygons: Polygon[]) => void;
};

const CanvasAnnotationContext = createContext<annotationStore>({ polygons: [], setPolygons: () => {}, updatePolygonList: () => {} });
export const useCanvasAnnotationContext = () => useContext(CanvasAnnotationContext);

export const CanvasAnnotationContextProvider = ({ children }: any) => {
  const [polygons, setPolygons] = useState<Polygon[]>([]);

  const updatePolygonList = (polygons: Polygon[]) => {
    setPolygons(polygons);
  };
  console.log('polygons', polygons);

  return <CanvasAnnotationContext.Provider value={{ polygons, setPolygons, updatePolygonList }}>{children}</CanvasAnnotationContext.Provider>;
};
