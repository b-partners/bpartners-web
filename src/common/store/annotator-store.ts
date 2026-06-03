import { AnnotationInfo } from '@/operations/annotator';
import { addAlphabet } from '@/operations/annotator/utils';
import { analyseGeneratedIdRef, analyseRoofIdRef, roofGlobalIdRef } from '@/operations/prospects/constants';
import { Polygon } from '@bpartners/annotator-component';
import { Dispatch, SetStateAction } from 'react';
import { v4 } from 'uuid';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { copyObject, ObjectUtilities } from '../utils';
import { useAnnotatorScreenSwitch } from './annotator-switch-store';

type AnnotationScreen = 'annotator' | 'roof-analyse';

interface Annotation {
  isFirst: boolean;
  polygon: Polygon;
  annotationInfos: AnnotationInfo;
  screen?: AnnotationScreen;
}

const resolveCurrentScreen = (): AnnotationScreen => (useAnnotatorScreenSwitch.getState().screen === 'roof-analyse' ? 'roof-analyse' : 'annotator');

const deriveScreenFromPolygon = (polygon?: Polygon, annotationInfos?: AnnotationInfo): AnnotationScreen => {
  const id = polygon?.id || '';
  if (id.includes(analyseRoofIdRef)) return 'roof-analyse';
  if (id.includes(analyseGeneratedIdRef)) return 'roof-analyse';
  if (annotationInfos?.labelType === 'velux') return 'roof-analyse';
  return 'annotator';
};

const getAnnotationScreen = (annotation: Annotation): AnnotationScreen =>
  annotation.screen ?? deriveScreenFromPolygon(annotation.polygon, annotation.annotationInfos);

interface State {
  annotations: Record<string, Annotation>;
  polygonToShowMeasurement: string;
  threeDFromSegmentation?: boolean;
  threeDGenerationId?: string;
  roofAnalyseId?: string;
}

const defaultValue: State = {
  annotations: {},
  polygonToShowMeasurement: undefined,
  threeDFromSegmentation: false,
  threeDGenerationId: undefined,
};

interface Actions {
  setAnnotations: (annotations: State['annotations']) => void;
  replacePolygonById: (id: string, polygon: Polygon) => void;
  updateAnnotationInfo: (annotation: AnnotationInfo) => void;
  removeAnnotationInfo: (id: string) => void;
  addPolygon: (polygon: Polygon) => void;
  updatePolygon: (id: string, polygon: Polygon) => void;
  replaceAnnotations: (polygons: Polygon[], annotationsInfos: AnnotationInfo[], screenOverride?: AnnotationScreen) => void;
  setScreenAnnotations: (screen: AnnotationScreen, polygons: Polygon[], annotationsInfos: AnnotationInfo[]) => void;
  clearScreenAnnotations: (screen: AnnotationScreen) => void;
  seedAnalyseRoofFromAnnotator: () => void;
  resetAnnotations: () => void;
  reset: () => void;
  updateRoofAnnotation: Dispatch<SetStateAction<Annotation>>;
  showMeasurement: (polygonId: string) => void;
  setThreeDFromSegmentation: (threeDFromSegmentation: boolean) => void;
  setThreeDGenerationId: (threeDGenerationId: string | undefined) => void;
  setRoofAnalyseId: (roofAnalyseId: string) => void;
}

// @ts-ignore
const useAnnotatorStore = create<State & Actions>(set => ({
  annotations: {},
  setAnnotations: annotations => set({ annotations }),
  removeAnnotationInfo: id =>
    set(state => {
      const annotations = copyObject(state.annotations);
      const isTheCurrentAnnotationTheFirst = annotations[id].isFirst;
      delete annotations[id];
      const restOfIds = Object.keys(annotations);
      if (!isTheCurrentAnnotationTheFirst || restOfIds.length === 0) return { annotations };
      annotations[restOfIds[0]].isFirst = true;
      return { annotations };
    }),
  addPolygon: polygon =>
    set(state => {
      const annotations = copyObject(state.annotations);
      if (annotations[polygon.id]) return { annotations };
      const currentScreen = resolveCurrentScreen();
      const screenAnnotations = Object.values(annotations).filter(a => getAnnotationScreen(a) === currentScreen);
      const isFirst = Object.values(annotations).length === 0;
      const hasRoof = screenAnnotations.some(a => a.annotationInfos?.labelType === 'roof');
      const isAnalyseScreen = currentScreen === 'roof-analyse';
      const secondaryType = isAnalyseScreen ? 'velux' : 'pan';
      const annotation: any = {
        isFirst,
        screen: currentScreen,
        polygon,
        annotationInfos: {
          polygonId: polygon.id,
          labelType: state.threeDFromSegmentation ? 'pan' : hasRoof ? secondaryType : 'roof',
          fillColor: polygon.fillColor,
          strokeColor: polygon.strokeColor,
          labelName: addAlphabet('Polygon', Object.values(annotations).length),
        },
      };

      annotations[polygon.id] = annotation;
      const annotationsKeyNotAnalyseResult = Object.keys(annotations).filter(key => !key.includes(analyseGeneratedIdRef) || key.includes(roofGlobalIdRef));
      const annotationsKeyAnalyseResult = Object.keys(annotations).filter(key => key.includes(analyseGeneratedIdRef) && !key.includes(roofGlobalIdRef));
      const reorderAnnotations = ObjectUtilities.reorder(annotations, [...annotationsKeyNotAnalyseResult, ...annotationsKeyAnalyseResult]);

      const updatedState: State = { annotations: copyObject(reorderAnnotations), polygonToShowMeasurement: state.polygonToShowMeasurement };

      if (isFirst) updatedState.polygonToShowMeasurement = polygon.id;

      return updatedState;
    }),
  replacePolygonById: (id, polygon) =>
    set(state => {
      const annotations = copyObject(state.annotations);
      if (!annotations[id]) return { annotations };
      annotations[id].polygon = polygon;
      return { annotations };
    }),
  updatePolygon: (id, polygon) =>
    set(state => {
      const annotations = copyObject(state.annotations);
      annotations[id].polygon = polygon;
      return { annotations };
    }),
  updateAnnotationInfo: annotationInfos =>
    set(state => {
      const annotations = copyObject(state.annotations);
      annotations[annotationInfos.polygonId].annotationInfos = annotationInfos;
      return { annotations };
    }),
  replaceAnnotations: (polygons, annotationsInfos, screenOverride) =>
    set(() => {
      const annotations: State['annotations'] = {};

      polygons.forEach((polygon, index) => {
        const isFirst = index === 0;
        const annotationInfos = annotationsInfos.find(({ polygonId }) => polygonId === polygon.id);
        const annotation = {
          isFirst,
          annotationInfos,
          polygon,
          screen: screenOverride ?? deriveScreenFromPolygon(polygon, annotationInfos),
        };
        annotations[polygon.id] = annotation;
      });

      return { annotations };
    }),
  setScreenAnnotations: (screen, polygons, annotationsInfos) =>
    set(state => {
      const annotations = copyObject(state.annotations);
      Object.keys(annotations)
        .filter(id => getAnnotationScreen(annotations[id]) === screen)
        .forEach(id => delete annotations[id]);

      polygons.forEach((polygon, index) => {
        annotations[polygon.id] = {
          isFirst: index === 0,
          annotationInfos: annotationsInfos.find(({ polygonId }) => polygonId === polygon.id),
          polygon,
          screen,
        };
      });

      if (polygons.length > 0) {
        Object.keys(annotations)
          .filter(id => getAnnotationScreen(annotations[id]) !== screen)
          .forEach(id => (annotations[id].isFirst = false));
      }

      const resultKeys = Object.keys(annotations).filter(key => key.includes(analyseGeneratedIdRef) && !key.includes(roofGlobalIdRef));
      const nonResultKeys = Object.keys(annotations).filter(key => !key.includes(analyseGeneratedIdRef) || key.includes(roofGlobalIdRef));
      return { annotations: copyObject(ObjectUtilities.reorder(annotations, [...nonResultKeys, ...resultKeys])) };
    }),
  clearScreenAnnotations: screen =>
    set(state => {
      const annotations = copyObject(state.annotations);
      Object.keys(annotations)
        .filter(id => getAnnotationScreen(annotations[id]) === screen)
        .forEach(id => delete annotations[id]);
      const remaining = Object.values(annotations);
      if (remaining.length > 0 && !remaining.some(a => a.isFirst)) remaining[0].isFirst = true;
      return { annotations };
    }),
  seedAnalyseRoofFromAnnotator: () =>
    set(state => {
      const values = Object.values(state.annotations);
      const hasAnalyseAnnotation = values.some(a => getAnnotationScreen(a) === 'roof-analyse');
      if (hasAnalyseAnnotation) return state;

      const roof2d = values.find(a => getAnnotationScreen(a) === 'annotator' && a.annotationInfos?.labelType === 'roof');
      if (!roof2d) return state;

      const annotations = copyObject(state.annotations);
      const analyseRoofId = `${v4()}__${analyseRoofIdRef}__${roofGlobalIdRef}`;
      annotations[analyseRoofId] = {
        isFirst: false,
        screen: 'roof-analyse',
        polygon: { ...copyObject(roof2d.polygon), id: analyseRoofId },
        annotationInfos: { ...copyObject(roof2d.annotationInfos), polygonId: analyseRoofId, labelType: 'roof' },
      };
      return { annotations };
    }),
  resetAnnotations: () =>
    set({
      annotations: {},
    }),
  updateRoofAnnotation: annotationOrDispatcher =>
    set(state => {
      const annotations = copyObject(state.annotations);
      const annotationValues = Object.values(annotations);
      if (annotationValues.length === 0) return state;
      const annotation = annotationValues.find(a => a.isFirst);
      const roofPolygonId = annotation.polygon.id;
      annotations[roofPolygonId] = typeof annotationOrDispatcher === 'function' ? annotationOrDispatcher(annotation) : annotationOrDispatcher;
      return { annotations };
    }),
  showMeasurement: polygonId =>
    set(state => {
      if (polygonId === state.polygonToShowMeasurement) return { polygonToShowMeasurement: '' };
      return { polygonToShowMeasurement: polygonId };
    }),
  setThreeDFromSegmentation(threeDFromSegmentation) {
    set({ threeDFromSegmentation });
  },
  threeDGenerationId: undefined,
  setThreeDGenerationId: threeDGenerationId => set({ threeDGenerationId }),
  reset() {
    set(defaultValue);
  },
  setRoofAnalyseId(roofAnalyseId) {
    set({ roofAnalyseId });
  },
}));

const useOneAnnotatorStore = (polygonId: string) => {
  const annotationInfos = useAnnotatorStore(useShallow(param => param.annotations[polygonId].annotationInfos));
  const removeAnnotationInfo = useAnnotatorStore(param => param.removeAnnotationInfo);
  const updateAnnotationInfo = useAnnotatorStore(param => param.updateAnnotationInfo);
  return { annotationInfos, removeAnnotationInfo: () => removeAnnotationInfo(polygonId), updateAnnotationInfo };
};

const useAnnotatorInfoStore = () => {
  const annotationInfos = useAnnotatorStore(useShallow(param => Object.values(param.annotations).map(a => a.annotationInfos)));
  return annotationInfos;
};

const useOneAnnotationStore = (id: string) => {
  const state = useAnnotatorStore(useShallow(params => params.annotations[id]));
  const { updatePolygon, addPolygon, removeAnnotationInfo, updateAnnotationInfo } = useAnnotatorStore(
    useShallow(params => ({
      updatePolygon: params.updatePolygon,
      addPolygon: params.addPolygon,
      updateAnnotationInfo: params.updateAnnotationInfo,
      removeAnnotationInfo: params.removeAnnotationInfo,
    }))
  );
  return {
    ...state,
    updatePolygon: (polygon: Polygon) => updatePolygon(id, polygon),
    addPolygon,
    updateAnnotationInfo,
    removeAnnotationInfo: () => removeAnnotationInfo(id),
  };
};

const usePolygonStore = () => {
  const polygonList = useAnnotatorStore(useShallow(params => Object.values(params.annotations).map(a => a.polygon)));
  const addPolygon = useAnnotatorStore(params => params.addPolygon);
  const replacePolygonById = useAnnotatorStore(params => params.replacePolygonById);
  const polygonIdList = polygonList.map(a => a.id);

  const setPolygons: Dispatch<SetStateAction<Polygon[]>> = _polygon => {
    const polygon = typeof _polygon === 'function' ? _polygon(polygonList) : _polygon;
    const newPolygon = polygon.find(p => !polygonIdList.includes(p.id));
    if (newPolygon) return addPolygon(newPolygon);

    const differentPolygon = polygon.find(
      p => JSON.stringify(p.points) !== JSON.stringify(annotatorStore.useAnnotatorStore.getState().annotations[p.id].polygon.points)
    );

    if (differentPolygon) return replacePolygonById(differentPolygon.id, differentPolygon);
  };

  return { polygonList, setPolygons };
};

const resolveScopedScreen = (screen: ReturnType<typeof useAnnotatorScreenSwitch.getState>['screen']): AnnotationScreen =>
  screen === 'roof-analyse' || screen === 'llm' ? 'roof-analyse' : 'annotator';

const useScreenPolygonStore = () => {
  const currentScreen = useAnnotatorScreenSwitch(state => resolveScopedScreen(state.screen));
  const polygonList = useAnnotatorStore(
    useShallow(params =>
      Object.values(params.annotations)
        .filter(a => getAnnotationScreen(a) === currentScreen)
        .map(a => a.polygon)
    )
  );
  const addPolygon = useAnnotatorStore(params => params.addPolygon);
  const replacePolygonById = useAnnotatorStore(params => params.replacePolygonById);

  const setPolygons: Dispatch<SetStateAction<Polygon[]>> = _polygon => {
    const polygon = typeof _polygon === 'function' ? _polygon(polygonList) : _polygon;
    const storedAnnotations = useAnnotatorStore.getState().annotations;
    const newPolygon = polygon.find(p => !storedAnnotations[p.id]);
    if (newPolygon) return addPolygon(newPolygon);

    const differentPolygon = polygon.find(p => JSON.stringify(p.points) !== JSON.stringify(storedAnnotations[p.id].polygon.points));
    if (differentPolygon) return replacePolygonById(differentPolygon.id, differentPolygon);
  };

  return { polygonList, setPolygons };
};

const useScreenAnnotatorInfoStore = () => {
  const currentScreen = useAnnotatorScreenSwitch(state => resolveScopedScreen(state.screen));
  return useAnnotatorStore(
    useShallow(param =>
      Object.values(param.annotations)
        .filter(a => getAnnotationScreen(a) === currentScreen)
        .map(a => a.annotationInfos)
    )
  );
};

const useAnalysePolygonStore = () => {
  const polygonList = useAnnotatorStore(
    useShallow(params =>
      Object.values(params.annotations)
        .filter(a => getAnnotationScreen(a) === 'roof-analyse')
        .map(a => a.polygon)
    )
  );
  return { polygonList };
};

const useAnalyseAnnotatorInfoStore = () =>
  useAnnotatorStore(
    useShallow(param =>
      Object.values(param.annotations)
        .filter(a => getAnnotationScreen(a) === 'roof-analyse')
        .map(a => a.annotationInfos)
    )
  );

export const annotatorStore = {
  usePolygonStore,
  useScreenPolygonStore,
  useAnalysePolygonStore,
  useOneAnnotatorStore,
  useAnnotatorStore,
  useAnnotatorInfoStore,
  useScreenAnnotatorInfoStore,
  useAnalyseAnnotatorInfoStore,
  useOneAnnotationStore,
};
