import { AnnotationInfo } from '@/operations/annotator';
import { AnnotatorFormState, useAnnotationInfosForm } from '@/operations/annotator/utils';
import { AnnotationCoveringFromAnalyse, cache } from '@/providers';
import { Polygon } from '@bpartners/annotator-component';
import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState } from 'react';
import { FormProvider, UseFieldArrayReturn } from 'react-hook-form';
import { NOOP_FN } from '../utils/noop_fn';
import { stringifyObj } from '../utils/stringify';
import { useAnnotatorComponentStore } from './annotator-component-store';

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
  roofAnalyseProperties?: RoofAnalyseProperties;
  slopeInfoOpen: boolean;
  annotationInfosFieldArrayState: UseFieldArrayReturn<AnnotatorFormState, 'annotationInfos', 'id'>;
  polygonsFieldArrayState: UseFieldArrayReturn<AnnotatorFormState, 'polygons', 'id'>;
  setRoofAnalyseProperties: Dispatch<SetStateAction<RoofAnalyseProperties>>;
  handleSlopeInfoToggle: () => void;
};

const CanvasAnnotationContext = createContext<AnnotationStore>({
  slopeInfoOpen: false,
  handleSlopeInfoToggle: NOOP_FN,
  setRoofAnalyseProperties: NOOP_FN,
  annotationInfosFieldArrayState: null,
  polygonsFieldArrayState: null,
});

export const useCanvasAnnotationContext = () => useContext(CanvasAnnotationContext);

export type CanvasAnnotationContextProviderProps = {
  children: ReactNode;
  defaultPolygons?: Polygon[];
  annotationInfo: AnnotationInfo[];
};

export const CanvasAnnotationContextProvider: FC<CanvasAnnotationContextProviderProps> = ({ children, defaultPolygons = [], annotationInfo }) => {
  const [roofAnalyseProperties, setRoofAnalyseProperties] = useState<RoofAnalyseProperties>();

  const { formState, annotationInfosFieldArrayState, polygonsFieldArrayState } = useAnnotationInfosForm(defaultPolygons, annotationInfo);
  const { setThereIsRoofPolygon } = useAnnotatorComponentStore();
  const [slopeInfoOpen, setSlopeInfoOpen] = useState(false);

  const handleSlopeInfoToggle = () => setSlopeInfoOpen(!slopeInfoOpen);

  useEffect(() => {
    formState.watch(({ polygons, annotationInfos }) => {
      if (annotationInfos.length === 1 && annotationInfos[0].labelType === 'roof') {
        setThereIsRoofPolygon(true);
      } else {
        setThereIsRoofPolygon(false);
      }
      cache.polygons((polygons || []) as Polygon[]);
    });
  }, []);

  const contextValues: AnnotationStore = {
    slopeInfoOpen,
    handleSlopeInfoToggle,
    setRoofAnalyseProperties,
    roofAnalyseProperties,
    annotationInfosFieldArrayState,
    polygonsFieldArrayState,
  };

  const memorizedContextValues: AnnotationStore = useMemo(() => contextValues, [stringifyObj(contextValues)]);

  return (
    <CanvasAnnotationContext.Provider value={memorizedContextValues}>
      <FormProvider {...formState}>{children}</FormProvider>
    </CanvasAnnotationContext.Provider>
  );
};
