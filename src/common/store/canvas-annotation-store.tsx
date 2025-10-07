import { AnnotationInfo } from '@/operations/annotator';
import { useAnnotationInfosForm } from '@/operations/annotator/utils';
import { AnnotationCoveringFromAnalyse, cache } from '@/providers';
import { Polygon } from '@bpartners/annotator-component';
import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { NOOP_FN } from '../utils/noop_fn';
import { stringifyObj } from '../utils/stringify';

export interface RoofAnalyseProperties {
  obstacle: boolean;
  usure_rate: number;
  global_rate_value: number;
  global_rate_type: string;
  moisissure_rate: number;
  humidite_rate: number;
  revetement_1: AnnotationCoveringFromAnalyse;
  revetement_2: AnnotationCoveringFromAnalyse | null;
}

export type AnnotationStore = {
  polygons: Polygon[];
  roofAnalyseProperties?: RoofAnalyseProperties;
  slopeInfoOpen: boolean;
  fieldArrayState: any;
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
  fieldArrayState: null,
});

export const useCanvasAnnotationContext = () => useContext(CanvasAnnotationContext);

export type CanvasAnnotationContextProviderProps = {
  children: ReactNode;
  defaultPolygons?: Polygon[];
  annotationInfo: AnnotationInfo[];
};

export const CanvasAnnotationContextProvider: FC<CanvasAnnotationContextProviderProps> = ({ children, defaultPolygons = [], annotationInfo }) => {
  const [polygons, setPolygons] = useState<Polygon[]>(defaultPolygons);
  const [slopeInfoOpen, setSlopeInfoOpen] = useState(false);
  const [roofAnalyseProperties, setRoofAnalyseProperties] = useState<RoofAnalyseProperties>();

  const handleSlopeInfoToggle = () => {
    setSlopeInfoOpen(!slopeInfoOpen);
  };

  const stringifiedPolygons = stringifyObj(polygons);

  useEffect(() => {
    cache.polygons(polygons);
  }, [stringifiedPolygons]);

  const { formState, fieldArrayState } = useAnnotationInfosForm(polygons, annotationInfo, roofAnalyseProperties);

  const contextValues: AnnotationStore = useMemo(
    () => ({ polygons, slopeInfoOpen, setPolygons, handleSlopeInfoToggle, setRoofAnalyseProperties, roofAnalyseProperties, fieldArrayState }),
    [slopeInfoOpen, stringifiedPolygons, setPolygons, handleSlopeInfoToggle, roofAnalyseProperties, setRoofAnalyseProperties, fieldArrayState]
  );

  return (
    <CanvasAnnotationContext.Provider value={contextValues}>
      <FormProvider {...formState}>{children}</FormProvider>
    </CanvasAnnotationContext.Provider>
  );
};
