import { cache } from '@/providers';
import { Polygon } from '@bpartners/annotator-component';
import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState } from 'react';
import { NOOP_FN } from '../utils/noop_fn';
import { stringifyObj } from '../utils/stringify';

export interface RoofAnalyseProperties {
  obstacle: boolean;
  usure_rate: number;
  global_rate_value: number;
  global_rate_type: string;
  moisissure_rate: number;
  humidite_rate: number;
}

export type AnnotationStore = {
  polygons: Polygon[];
  roofAnalyseProperties?: RoofAnalyseProperties;
  slopeInfoOpen: boolean;
  setPolygons: Dispatch<SetStateAction<Polygon[]>>;
  setRoofAnalyseProperties: Dispatch<SetStateAction<RoofAnalyseProperties>>;
  handleSlopeInfoToggle: () => void;
};

const CanvasAnnotationContext = createContext<AnnotationStore>({
  polygons: [],
  slopeInfoOpen: false,
  setPolygons: NOOP_FN,
  handleSlopeInfoToggle: NOOP_FN,
  setRoofAnalyseProperties: NOOP_FN,
});

export const useCanvasAnnotationContext = () => useContext(CanvasAnnotationContext);

export type CanvasAnnotationContextProviderProps = {
  children: ReactNode;
  defaultPolygons?: Polygon[];
};

export const CanvasAnnotationContextProvider: FC<CanvasAnnotationContextProviderProps> = ({ children, defaultPolygons = [] }) => {
  const [polygons, setPolygons] = useState<Polygon[]>(defaultPolygons);
  const [slopeInfoOpen, setSlopeInfoOpen] = useState(false);
  const [roofAnalyseProperties, setRoofAnalyseProperties] = useState<RoofAnalyseProperties>();

  const handleSlopeInfoToggle = () => {
    setSlopeInfoOpen(!slopeInfoOpen);
  };

  const stringifiedPolygons = stringifyObj(polygons);

  const contextValues: AnnotationStore = useMemo(
    () => ({ polygons, slopeInfoOpen, setPolygons, handleSlopeInfoToggle, setRoofAnalyseProperties, roofAnalyseProperties }),
    [slopeInfoOpen, stringifiedPolygons, setPolygons, handleSlopeInfoToggle, roofAnalyseProperties, setRoofAnalyseProperties]
  );

  useEffect(() => {
    cache.polygons(polygons);
  }, [stringifiedPolygons]);

  return <CanvasAnnotationContext.Provider value={contextValues}>{children}</CanvasAnnotationContext.Provider>;
};
