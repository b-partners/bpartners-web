import { annotatorStore, getAnnotationScreen } from '@/common/store';

export type ThreeDGenerationMode = 'roof' | 'pan';

interface ThreeDGenerationSnapshot {
  mode: ThreeDGenerationMode;
  signature: string;
}

const SNAPSHOT_KEY = (id: string) => `bp_3d_generation_2d_snapshot:${id}`;

export const getTwoDGenerationSignature = (mode: ThreeDGenerationMode): string => {
  const annotations = annotatorStore.useAnnotatorStore.getState().annotations;
  const annotationValues = Object.values(annotations).filter(annotation => getAnnotationScreen(annotation) === 'annotator');
  const labelType = mode === 'pan' ? 'pan' : 'roof';
  const relevantPolygons = annotationValues.filter(annotation => annotation.annotationInfos?.labelType === labelType).map(annotation => annotation.polygon);
  return JSON.stringify(relevantPolygons.map(polygon => ({ id: polygon.id, points: polygon.points })));
};

export const saveThreeDGenerationSnapshot = (id: string | undefined, mode: ThreeDGenerationMode) => {
  if (!id) return;
  const snapshot: ThreeDGenerationSnapshot = { mode, signature: getTwoDGenerationSignature(mode) };
  localStorage.setItem(SNAPSHOT_KEY(id), JSON.stringify(snapshot));
};

export const getThreeDGenerationSnapshot = (id: string | undefined): ThreeDGenerationSnapshot | null => {
  if (!id) return null;
  const raw = localStorage.getItem(SNAPSHOT_KEY(id));
  return raw ? JSON.parse(raw) : null;
};

export const hasTwoDStateChangedSince = (id: string | undefined, mode: ThreeDGenerationMode): boolean => {
  const snapshot = getThreeDGenerationSnapshot(id);
  if (!snapshot) return false;
  if (snapshot.mode !== mode) return true;
  return snapshot.signature !== getTwoDGenerationSignature(mode);
};
