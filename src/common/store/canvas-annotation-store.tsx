import { Polygon } from '@bpartners/annotator-component';
import { NOOP_FN } from '../utils/noop_fn';
import { createContext, FC, ReactNode, useContext, useMemo, useState } from 'react';
import { stringifyObj } from '../utils/stringify';

export type AnnotationStore = {
  polygons: Polygon[];
  slopeInfoOpen: boolean;
  setPolygons: (polygons: Polygon[]) => void;
  removeAnnotationByPolygonId: (polygonId: string) => void;
  handleSlopeInfoToggle: () => void;
};

const CanvasAnnotationContext = createContext<AnnotationStore>({
  polygons: [],
  slopeInfoOpen: false,
  setPolygons: NOOP_FN,
  handleSlopeInfoToggle: NOOP_FN,
  removeAnnotationByPolygonId: NOOP_FN
});

export const useCanvasAnnotationContext = () => useContext(CanvasAnnotationContext);

export type CanvasAnnotationContextProviderProps = {
  children: ReactNode;
} & Partial<Pick<AnnotationStore, "removeAnnotationByPolygonId" | "polygons" | "setPolygons">>

export const CanvasAnnotationContextProvider: FC<CanvasAnnotationContextProviderProps> = ({
  children,
  polygons = [],
  setPolygons = NOOP_FN,
  removeAnnotationByPolygonId = NOOP_FN,
}) => {
  const [slopeInfoOpen, setSlopeInfoOpen] = useState(false);

  const handleSlopeInfoToggle = () => {
    setSlopeInfoOpen(!slopeInfoOpen);
  };

  const contextValues: AnnotationStore = useMemo(
    () => ({ polygons, slopeInfoOpen, setPolygons, removeAnnotationByPolygonId, handleSlopeInfoToggle }),
    [slopeInfoOpen, stringifyObj(polygons), setPolygons, removeAnnotationByPolygonId, handleSlopeInfoToggle]
  );

  return (
    <CanvasAnnotationContext.Provider value={contextValues}>
      {children}
    </CanvasAnnotationContext.Provider>
  );
};
