import { cache } from '@/providers';
import { Polygon } from '@bpartners/annotator-component';
import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState } from 'react';
import { NOOP_FN } from '../utils/noop_fn';
import { stringifyObj } from '../utils/stringify';

export type AnnotationStore = {
  polygons: Polygon[];
  slopeInfoOpen: boolean;
  setPolygons: Dispatch<SetStateAction<Polygon[]>>;
  handleSlopeInfoToggle: () => void;
};

const CanvasAnnotationContext = createContext<AnnotationStore>({
  polygons: [],
  slopeInfoOpen: false,
  setPolygons: NOOP_FN,
  handleSlopeInfoToggle: NOOP_FN,
});

export const useCanvasAnnotationContext = () => useContext(CanvasAnnotationContext);

export type CanvasAnnotationContextProviderProps = {
  children: ReactNode;
  defaultPolygons?: Polygon[];
};

export const CanvasAnnotationContextProvider: FC<CanvasAnnotationContextProviderProps> = ({ children, defaultPolygons = [] }) => {
  const [polygons, setPolygons] = useState<Polygon[]>(defaultPolygons);
  const [slopeInfoOpen, setSlopeInfoOpen] = useState(false);

  const handleSlopeInfoToggle = () => {
    setSlopeInfoOpen(!slopeInfoOpen);
  };

  const contextValues: AnnotationStore = useMemo(
    () => ({ polygons, slopeInfoOpen, setPolygons, handleSlopeInfoToggle }),
    [slopeInfoOpen, stringifyObj(polygons), setPolygons, handleSlopeInfoToggle]
  );

  useEffect(() => {
    cache.polygons(polygons);
  }, [stringifyObj(polygons)]);

  return <CanvasAnnotationContext.Provider value={contextValues}>{children}</CanvasAnnotationContext.Provider>;
};
