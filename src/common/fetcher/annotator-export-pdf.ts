import { AnnotationInfo } from '@/operations/annotator';
import {
  cityJsonMapper,
  cropPolygons,
  exportAnnotationMapper,
  ExportAnnotationMapperArgs,
  findSurfaceGeometry,
  shiftPolygons,
} from '@/operations/annotator/utils';
import { areaPictureApi, fileProvider, getCached } from '@/providers';
import { getAnalyseImageFileId } from '@/constants';
import { ExportAreaPictureAnnotation, FileType } from '@bpartners/typescript-client';
import { useMutation } from '@tanstack/react-query';
import { useNotify } from 'react-admin';
import { v4 } from 'uuid';
import { PanCapture, PanCaptureKind, useCityJsonPanCaptureStore } from '../hooks/useCityJsonPanCapture';
import { annotatorStore, roof3DStore, useAnnotator3DStore, useAnnotatorComponentStore } from '../store';
import { downloadPdf, getFileUrl, jsonToFile, sentryErrorLogger, wait } from '../utils';

const dataUrlToArrayBuffer = (dataUrl: string): ArrayBuffer => {
  const base64 = dataUrl.split(',')[1] ?? '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};

const waitForPanCapture = (timeoutMs = 30000): Promise<PanCapture[]> =>
  new Promise(resolve => {
    const startedAt = performance.now();
    const tick = () => {
      const state = useCityJsonPanCaptureStore.getState();
      if (!state.isCapturing) return resolve(state.captures);
      if (performance.now() - startedAt > timeoutMs) {
        state.setIsCapturing(false);
        return resolve(useCityJsonPanCaptureStore.getState().captures);
      }
      requestAnimationFrame(tick);
    };
    tick();
  });

const retry = async <T>(fn: () => Promise<T>, retries = 5, delayMs = 500): Promise<T> => {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries) await wait(delayMs);
    }
  }
  throw lastError;
};

const savePanCaptureImage = async (capture: PanCapture): Promise<string> => {
  const fileId = v4();
  const fileAsArrayBuffer = dataUrlToArrayBuffer(capture.dataUrl);
  await retry(() => fileProvider.update([{ fileId, fileType: FileType.IMAGE, fileMimeType: 'image/png', fileAsArrayBuffer }]));
  return fileId;
};

interface SavedCapture {
  capture: PanCapture;
  id: string;
}

const captureAndSaveImages = async (): Promise<SavedCapture[]> => {
  const { isMounted, triggerCapture } = useCityJsonPanCaptureStore.getState();

  if (!isMounted) return [];

  triggerCapture();
  const captures = await waitForPanCapture();
  const savedIds = await Promise.all(captures.map(savePanCaptureImage));

  return captures.map((capture, index) => ({ capture, id: savedIds[index] }));
};

const panImageIdsFromCaptures = (saved: SavedCapture[]): string[] =>
  saved
    .filter(({ capture }) => capture.kind === 'pan')
    .sort((a, b) => a.capture.index - b.capture.index)
    .map(({ id }) => id);

const imageIdForCapture = (saved: SavedCapture[], kind: PanCaptureKind, index: number): string | undefined =>
  saved.find(({ capture }) => capture.kind === kind && capture.index === index)?.id;

const mapExportAnnotationInfoArea = (annotationInfos: AnnotationInfo[]) => {
  const validAnnotationInfos = (annotationInfos ?? []).filter((info): info is AnnotationInfo => Boolean(info?.polygonId));
  const labelNames: Record<string, number> = {};

  validAnnotationInfos.forEach(({ area, polygonId }) => {
    const labelNameSplitted = polygonId.split('___');

    if (labelNameSplitted.length > 0) {
      labelNames[labelNameSplitted[1]] = (area || 0) + (labelNames[labelNameSplitted[1]] || 0);
    }
  });

  return validAnnotationInfos.map(annotationInfo => {
    const currentLabeNameSplitted = annotationInfo.polygonId.split('___');

    if (currentLabeNameSplitted.length === 0) {
      return annotationInfo;
    }

    return { ...annotationInfo, area: labelNames[currentLabeNameSplitted[1]] };
  });
};

interface Params {
  onSuccess?: () => void;
  onError?: () => void;
}

export const useAnnotatorExportAsPdf = (params: Params) => {
  const notify = useNotify();
  const { imageUrl, cityJsonModel } = useAnnotator3DStore();
  const { polygonList: analysePolygons } = annotatorStore.useAnalysePolygonStore();
  const analyseAnnotationInfos = annotatorStore.useAnalyseAnnotatorInfoStore();
  const { polygonList: roof2DPolygons } = annotatorStore.use2DRoofPolygonStore();
  const roof2DAnnotationInfos = annotatorStore.use2DRoofAnnotatorInfoStore();
  const { polygonList: pan2DPolygons } = annotatorStore.use2DPanPolygonStore();
  const pan2DAnnotationInfos = annotatorStore.use2DPanAnnotatorInfoStore();
  const hasAnalysePolygons = analysePolygons.length > 0;
  const has2DRoofPolygons = roof2DPolygons.length > 0;

  const selectedPolygons = hasAnalysePolygons ? analysePolygons : has2DRoofPolygons ? roof2DPolygons : pan2DPolygons;
  const annotationInfos = hasAnalysePolygons ? analyseAnnotationInfos : has2DRoofPolygons ? roof2DAnnotationInfos : pan2DAnnotationInfos;

  let exportAreaPictureAnnotation: ExportAreaPictureAnnotation = undefined;

  const resolveExportPolygons = () => {
    const { cropRegion, analyseImageFileId, areaPictureDetails } = useAnnotatorComponentStore.getState();
    if (!hasAnalysePolygons) return shiftPolygons(selectedPolygons, areaPictureDetails, true);
    const exportsCroppedAnalyseImage = !!cropRegion && !!analyseImageFileId;
    return exportsCroppedAnalyseImage ? cropPolygons(selectedPolygons, cropRegion) : selectedPolygons;
  };

  const mutationFn = async (params: ExportAnnotationMapperArgs) => {
    const { accountId } = getCached.userInfo();

    const polygons = resolveExportPolygons();

    const { areaPictureDetails } = useAnnotatorComponentStore.getState();
    const analyseImageUrl = getFileUrl(getAnalyseImageFileId(areaPictureDetails.fileId), 'AREA_PICTURE');

    const has3dSurfaces = cityJsonModel ? !!findSurfaceGeometry(cityJsonModel) : false;
    const shouldAdd3d = imageUrl && cityJsonModel && has3dSurfaces;

    const savedCaptures = await captureAndSaveImages();
    const panImageIds = panImageIdsFromCaptures(savedCaptures);

    const { savedPolygons, savedLines, panNames, edgeTypes } = roof3DStore.useRoof3DStore.getState();
    const userPolygonPans = savedPolygons.map((polygon, index) =>
      cityJsonMapper.userPolygonToPan(polygon, imageIdForCapture(savedCaptures, 'polygon', index + 1), 0)
    );
    const userLinePans = savedLines.map((line, index) => cityJsonMapper.userLineToPan(line, imageIdForCapture(savedCaptures, 'line', index + 1), 0));
    const userPans = [...userPolygonPans, ...userLinePans];

    const exportAnnotation3D = shouldAdd3d ? cityJsonMapper.toExportAreaPictureAnnotation3D(cityJsonModel, panImageIds, panNames, edgeTypes, []) : undefined;

    exportAreaPictureAnnotation = await exportAnnotationMapper({
      ...params,
      imageUrl: analyseImageUrl,
      polygons,
      annotationInfos: mapExportAnnotationInfoArea(annotationInfos),
    });

    exportAreaPictureAnnotation['3d'] = userPans.length ? { pans: [...(exportAnnotation3D?.pans ?? []), ...userPans] } : exportAnnotation3D;

    const { data } = await areaPictureApi().exportAreaPictureAnnotationToPdf(
      accountId,
      shouldAdd3d ? imageUrl : undefined,
      jsonToFile(exportAreaPictureAnnotation)
    );
    const { value } = data;
    await downloadPdf(value, `Rapport d'analyse - ${params.address} - ${v4().slice(0, 8)}.pdf`);
  };

  const onSuccess = () => notify('Le rapport sera envoyé à votre adresse email dans quelques instants.');
  const onError = (error: any) => {
    const message = error?.response?.data?.message ?? error?.message ?? 'Erreur inconnue';
    try {
      sentryErrorLogger(message, { payload: exportAreaPictureAnnotation });
    } finally {
      notify("Une erreur s'est produite lors de l'exportation du rapport d'analyse.\n" + message, { type: 'error', multiLine: true });
    }
  };

  return useMutation({ mutationFn, onSuccess, onError, ...params });
};
