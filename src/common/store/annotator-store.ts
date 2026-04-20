import { AnnotationInfo } from '@/operations/annotator';
import { addAlphabet } from '@/operations/annotator/utils';
import { analyseGeneratedIdRef, roofGlobalIdRef } from '@/operations/prospects/constants';
import { Polygon } from '@bpartners/annotator-component';
import { Dispatch, SetStateAction } from 'react';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { copyObject } from '../utils';

interface Annotation {
  isFirst: boolean;
  polygon: Polygon;
  annotationInfos: AnnotationInfo;
}

interface State {
  annotations: Record<string, Annotation>;
}

interface Actions {
  setAnnotations: (annotations: State['annotations']) => void;
  replacePolygonById: (id: string, polygon: Polygon) => void;
  updateAnnotationInfo: (annotation: AnnotationInfo) => void;
  removeAnnotationInfo: (id: string) => void;
  addPolygon: (polygon: Polygon) => void;
  updatePolygon: (id: string, polygon: Polygon) => void;
  replaceAnnotations: (polygons: Polygon[], annotationsInfos: AnnotationInfo[]) => void;
  resetAnnotations: () => void;
  updateRoofAnnotation: Dispatch<SetStateAction<Annotation>>;
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
      const isFirst = Object.values(annotations).length === 0;
      const annotation: any = {
        isFirst,
        polygon,
        annotationInfos: {
          polygonId: polygon.id,
          labelType: 'roof',
          fillColor: polygon.fillColor,
          strokeColor: polygon.strokeColor,
          labelName: addAlphabet('Polygon', Object.values(annotations).length),
        },
      };
      annotations[polygon.id] = annotation;

      return { annotations };
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
  replaceAnnotations: (polygons, annotationsInfos) =>
    set(() => {
      const annotations: State['annotations'] = {};

      polygons.forEach((polygon, index) => {
        const isFirst = index === 0;
        const annotation = {
          isFirst,
          annotationInfos: annotationsInfos.find(({ polygonId }) => polygonId === polygon.id),
          polygon,
        };
        annotations[polygon.id] = annotation;
      });

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
  const polygonList = useAnnotatorStore(params => {
    let isSecond = false;
    const currentPolygons = Object.values(params.annotations).map(a => {
      const currentPolygon = a.polygon;
      if ((currentPolygon.id.includes(analyseGeneratedIdRef) && !currentPolygon.id.includes(roofGlobalIdRef)) || currentPolygon.isInvisible || isSecond) {
        currentPolygon.measurements = currentPolygon?.measurements?.map(m => ({ ...m, isInvisible: true }));
      } else {
        isSecond = true;
        currentPolygon.measurements = currentPolygon?.measurements?.map(m => ({ ...m, isInvisible: false }));
      }
      return currentPolygon;
    });

    return currentPolygons;
  });
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

export const annotatorStore = {
  usePolygonStore,
  useOneAnnotatorStore,
  useAnnotatorStore,
  useAnnotatorInfoStore,
  useOneAnnotationStore,
};
