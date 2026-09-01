import { annotatorStore, roof3DStore, useAnnotator3DStore, useAnnotatorComponentStore } from '@/common/store';
import { ANNOTATION_WEAR_TRANSLATION, TOITURE_ETAT_APPARENT_TRANSLATION } from '@/constants';
import { annotationCoveringMapper, cache } from '@/providers';
import { ExportAreaPictureAnnotation3DPan } from '@bpartners/typescript-client';
import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';
import { cityJsonMapper, collectRoofBoundaries, collectWallBoundaries, findSurfaceGeometry } from './city-json-mapper';
import { calculateGlobalRate, isAnalyseRoofAnnotation } from './global-rate-calculator';

const baseUrl = `${process.env.LLM_ANALYSE_RESULT}`;
const apiKey = `${process.env.LLM_API_KEY}`;

interface ToitureReportRequest {
  adresse?: string;
  gps?: string;
  revetement?: string;
  revetement2?: string;
  surfaceRampantM2?: number;
  hauteurBatiment?: number;
  penteDeg?: number;
  pansToiture3d?: ExportAreaPictureAnnotation3DPan[];
  niveauUsure?: string;
  tauxUsurePct?: number;
  tauxMoisissurePct?: number;
  tauxHumiditePct?: number;
  commentaireCouvreur?: string;
  etatApparent: string;
  scoreDegradationVisible?: number;
}

const weightedAverage = (items: { value: number; weight: number }[]): number | undefined => {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  return totalWeight ? items.reduce((sum, item) => sum + item.value * item.weight, 0) / totalWeight : undefined;
};

const buildPansToiture3d = (): ExportAreaPictureAnnotation3DPan[] | undefined => {
  const { cityJsonModel } = useAnnotator3DStore.getState();
  if (!cityJsonModel || !findSurfaceGeometry(cityJsonModel)) return undefined;

  const { panNames, edgeTypes, savedPolygons, savedLines } = roof3DStore.useRoof3DStore.getState();
  const { pans } = cityJsonMapper.toExportAreaPictureAnnotation3D(cityJsonModel, [], panNames, edgeTypes);

  return [
    ...pans,
    ...savedPolygons.map(polygon => cityJsonMapper.userPolygonToPan(polygon, cityJsonModel)),
    ...savedLines.map(line => cityJsonMapper.userLineToPan(line, cityJsonModel)),
  ];
};

const buildGeometryFields = (): Pick<ToitureReportRequest, 'surfaceRampantM2' | 'penteDeg' | 'hauteurBatiment'> => {
  const { cityJsonModel } = useAnnotator3DStore.getState();
  if (!cityJsonModel) return {};

  const { roofBoundaries, totalArea } = collectRoofBoundaries(cityJsonModel);
  const wallBoundaries = collectWallBoundaries(cityJsonModel);

  return {
    surfaceRampantM2: totalArea || undefined,
    penteDeg: weightedAverage(roofBoundaries.map(({ area, slope }) => ({ value: slope, weight: area }))),
    hauteurBatiment: wallBoundaries.length ? Math.max(...wallBoundaries.map(wall => wall.height)) : undefined,
  };
};

export const useLlmResultQuery = () => {
  const { annotationInfos, polygon } = annotatorStore.useAnnotatorStore(useShallow(p => Object.values(p.annotations).find(isAnalyseRoofAnnotation))) || {};

  const { moldRate, wearLevel, humidityLevel, comment, covering, covering2, wear, area: _area, slope } = annotationInfos || {};

  const area = _area || polygon?.surface;

  const queryFn = async () => {
    try {
      const globalRate = calculateGlobalRate();
      const { address, geoPositions } = useAnnotatorComponentStore.getState().areaPictureDetails || {};
      const geometryFields = buildGeometryFields();

      const payload: ToitureReportRequest = {
        adresse: address,
        gps: geoPositions?.[0] ? `${geoPositions[0].latitude},${geoPositions[0].longitude}` : undefined,
        revetement: annotationCoveringMapper.fromAnalyseResultToDomain(covering),
        revetement2: covering2 ? annotationCoveringMapper.fromAnalyseResultToDomain(covering2) : undefined,
        surfaceRampantM2: geometryFields.surfaceRampantM2 ?? area,
        hauteurBatiment: geometryFields.hauteurBatiment,
        penteDeg: geometryFields.penteDeg ?? slope,
        pansToiture3d: buildPansToiture3d(),
        niveauUsure: wear ? ANNOTATION_WEAR_TRANSLATION[wear] : undefined,
        tauxUsurePct: wearLevel,
        tauxMoisissurePct: moldRate,
        tauxHumiditePct: humidityLevel,
        commentaireCouvreur: comment,
        etatApparent:
          TOITURE_ETAT_APPARENT_TRANSLATION[(globalRate?.type ?? 'E') as keyof typeof TOITURE_ETAT_APPARENT_TRANSLATION] ?? TOITURE_ETAT_APPARENT_TRANSLATION.E,
        scoreDegradationVisible: globalRate?.value,
      };

      const result = await fetch(`${baseUrl}?x-api-key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/html' },
        body: JSON.stringify(payload),
      });

      const _htmlResult = await result.text();
      const htmlResult = _htmlResult.split('</head>')[1];
      cache.llmResult(htmlResult || '');
      return htmlResult;
    } catch (error) {
      console.log(error);
    }
  };

  return useQuery({
    queryFn,
    queryKey: [JSON.stringify({ moldRate, wearLevel, humidityLevel, comment, area, covering, covering2, wear, slope })],
    enabled: !!annotationInfos && Object.values(annotationInfos || {}).length > 0,
  });
};
