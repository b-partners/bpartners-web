import { cache, getCached } from '@/providers';
import { Polygon } from '@bpartners/annotator-component';
import { createContext, FC, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

type annotationStore = {
  setPolygons: (data: any) => void;
  polygons: Polygon[];
  updatePolygonList: (polygons: Polygon[]) => void;
  slopeInfoOpen: boolean;
  handleSlopeInfoToggle: () => void;
};

const CanvasAnnotationContext = createContext<annotationStore>({
  polygons: [],
  setPolygons: () => {},
  updatePolygonList: () => {},
  slopeInfoOpen: false,
  handleSlopeInfoToggle: () => {},
});
export const useCanvasAnnotationContext = () => useContext(CanvasAnnotationContext);

export type CanvasAnnotationContextProviderProps = {
  children: ReactNode;
  defaultPolygons?: Polygon[];
};
export const CanvasAnnotationContextProvider: FC<CanvasAnnotationContextProviderProps> = ({ children, defaultPolygons = [] }) => {
  const [polygons, setPolygons] = useState<Polygon[]>(defaultPolygons);
  const [slopeInfoOpen, setSlopeInfoOpen] = useState(false);

  useEffect(() => {
    const cachedPolygon = getCached.polygons();
    cachedPolygon && setPolygons(cachedPolygon);
  }, []);

  useEffect(() => {
    cache.polygons(polygons);
  }, [polygons]);

  const updatePolygonList = (polygons: Polygon[]) => {
    setPolygons(polygons);
  };

  const handleSlopeInfoToggle = () => {
    setSlopeInfoOpen(!slopeInfoOpen);
  };

  const contextValues = useMemo(
    () => ({ polygons, setPolygons, updatePolygonList, slopeInfoOpen, handleSlopeInfoToggle }),
    [polygons, setPolygons, updatePolygonList, slopeInfoOpen, handleSlopeInfoToggle]
  );

  return <CanvasAnnotationContext.Provider value={contextValues}>{children}</CanvasAnnotationContext.Provider>;
};
