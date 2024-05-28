import { Polygon } from '@bpartners/annotator-component';
import { createContext, useContext, useState } from 'react';

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

export const CanvasAnnotationContextProvider = ({ children }: any) => {
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [slopeInfoOpen, setSlopeInfoOpen] = useState(false);

  const updatePolygonList = (polygons: Polygon[]) => {
    setPolygons(polygons);
  };

  const handleSlopeInfoToggle = () => {
    setSlopeInfoOpen(!slopeInfoOpen);
  };

  return (
    <CanvasAnnotationContext.Provider value={{ polygons, setPolygons, updatePolygonList, slopeInfoOpen, handleSlopeInfoToggle }}>
      {children}
    </CanvasAnnotationContext.Provider>
  );
};
