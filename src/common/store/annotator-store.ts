import { AnnotationInfo } from '@/operations/annotator';
import { addAlphabet } from '@/operations/annotator/utils';
import { Polygon } from '@bpartners/annotator-component';
import { Dispatch, SetStateAction } from 'react';
import { create } from 'zustand';

const copyObject = <T>(object: T) => JSON.parse(JSON.stringify(object)) as typeof object;

interface State {
  annotations: Record<
    string,
    {
      isFirst: boolean;
      polygon: Polygon;
      annotationInfos: AnnotationInfo;
    }
  >;
}

interface Actions {
  setAnnotations: (annotations: State['annotations']) => void;
  updateAnnotationInfo: (annotation: AnnotationInfo) => void;
  removeAnnotationInfo: (id: string) => void;
  addPolygon: (polygon: Polygon) => void;
  updatePolygon: (id: string, polygon: Polygon) => void;
}

const useAnnotatorStore = create<State & Actions>(set => ({
  annotations: {},
  setAnnotations: annotations => set({ annotations }),
  removeAnnotationInfo: id =>
    set(state => {
      let annotations = copyObject(state.annotations);
      const isTheCurrentAnnotationTheFirst = annotations[id].isFirst;
      delete annotations[id];
      const restOfIds = Object.keys(annotations);
      if (!isTheCurrentAnnotationTheFirst || restOfIds.length === 0) return { annotations };
      annotations[restOfIds[0]].isFirst = true;
      return { annotations };
    }),
  addPolygon: polygon =>
    set(state => {
      let annotations = copyObject(state.annotations);

      annotations[polygon.id] = {
        isFirst: Object.values(annotations).length === 0,
        polygon,
        annotationInfos: {
          polygonId: polygon.id,
          labelType: 'roof',
          fillColor: polygon.fillColor,
          strokeColor: polygon.strokeColor,
          labelName: addAlphabet('Polygon', Object.values(annotations).length),
        },
      };

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
      let annotations = copyObject(state.annotations);
      annotations[annotationInfos.polygonId].annotationInfos = annotationInfos;
      return { annotations };
    }),
}));

const useOneAnnotatorStore = (polygonId: string) => {
  const annotationInfos = useAnnotatorStore(param => param.annotations[polygonId].annotationInfos);
  const removeAnnotationInfo = useAnnotatorStore(param => param.removeAnnotationInfo);
  const updateAnnotationInfo = useAnnotatorStore(param => param.updateAnnotationInfo);
  return { annotationInfos, removeAnnotationInfo: () => removeAnnotationInfo(polygonId), updateAnnotationInfo };
};

const useAnnotatorInfoStore = () => {
  const annotationInfos = useAnnotatorStore(param => Object.values(param.annotations).map(a => a.annotationInfos));
  return annotationInfos;
};

const useOneAnnotationStore = (id: string) => {
  const state = useAnnotatorStore(params => params.annotations[id]);
  const updatePolygon = useAnnotatorStore(params => params.updatePolygon);
  const addPolygon = useAnnotatorStore(params => params.addPolygon);
  const updateAnnotationInfo = useAnnotatorStore(params => params.updateAnnotationInfo);
  const removeAnnotationInfo = useAnnotatorStore(params => params.removeAnnotationInfo);

  return {
    ...state,
    updatePolygon: (polygon: Polygon) => updatePolygon(id, polygon),
    addPolygon,
    updateAnnotationInfo,
    removeAnnotationInfo: () => removeAnnotationInfo(id),
  };
};

const usePolygonStore = () => {
  const polygonList = useAnnotatorStore(params => Object.values(params.annotations).map(a => a.polygon));
  const addPolygon = useAnnotatorStore(params => params.addPolygon);
  const polygonIdList = polygonList.map(a => a.id);

  const setPolygons: Dispatch<SetStateAction<Polygon[]>> = _polygon => {
    let polygon = typeof _polygon === 'function' ? _polygon(polygonList) : _polygon;
    const newPolygon = polygon.find(p => !polygonIdList.includes(p.id));
    if (newPolygon) addPolygon(newPolygon);
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
