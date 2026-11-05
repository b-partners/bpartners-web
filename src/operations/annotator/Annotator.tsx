import { BPLoader } from '@/common/components';
import { parseUrlParams } from '@/common/utils';
import { useCreditRequirement } from '@/operations/account/components/billing/use-credit-requirement';
import { AnalysisStatusChips, useAnalysisProject } from '@/operations/analysis-projects';
import { RoofAnnotator } from '@bpartners/roof-analyser';
import { AnalysisProject } from '@bpartners/typescript-client';
import { Box, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useGetOne } from 'react-admin';
import { useNavigate, useParams } from 'react-router-dom';
import { hasSavedGeoSession, readGeoSessionId } from './geo-session';
import { GEO_SESSION_OPTIONS, ROOF_ANALYSER_CONFIG, ROOF_MODEL_OPTIONS } from './roof-analyser-config';
import { AnnotatorStyle } from './style';
import { useGeoPosition } from './use-geo-position';
import { useRoofAnalyserCredentials } from './use-roof-analyser-credentials';

const PROJECT_REFRESH_MS = 15000;

const isCreditShort = (project?: AnalysisProject) => project?.creditsSufficient === false && (project.creditCost ?? 0) > 0;

const readParam = (value?: string) => {
  const trimmed = (value ?? '').trim();
  return trimmed && trimmed !== 'undefined' && trimmed !== 'null' ? trimmed : undefined;
};

export const Annotator = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { address: addressParam, flow } = parseUrlParams();
  const { accessToken, accountId, accountHolderId, userId, error: credentialsError } = useRoofAnalyserCredentials();

  const address = readParam(addressParam);
  const isNewSession = flow === 'geo';
  const { data: draftAnnotation, isLoading: isDraftLoading } = useGetOne('drafts-annotations', { id: projectId }, { enabled: !isNewSession && !!projectId });
  const sessionId = isNewSession ? projectId : readGeoSessionId(draftAnnotation);
  const sessionAddress = address ?? draftAnnotation?.areaPicture?.address;
  const needsPosition = isNewSession || (!!sessionId && !hasSavedGeoSession(draftAnnotation));
  const { position, isLoading: isGeocoding, error: geocodeError } = useGeoPosition(needsPosition ? sessionAddress : undefined, accessToken);
  const isLocating = isGeocoding || (needsPosition && !!sessionAddress && !position);

  const { data: analysisProject, isLoading: isProjectLoading } = useAnalysisProject(sessionId, { refetchInterval: PROJECT_REFRESH_MS });
  const { openCreditsRequiredModal } = useCreditRequirement();
  const openedProjectRef = useRef(analysisProject);
  if (analysisProject && !openedProjectRef.current) openedProjectRef.current = analysisProject;
  const isCreditBlocked = isCreditShort(openedProjectRef.current);

  useEffect(() => {
    if (!isCreditBlocked) return;
    openCreditsRequiredModal();
    navigate('/');
  }, [isCreditBlocked, navigate, openCreditsRequiredModal]);

  const error = credentialsError
    ? `La session n'a pas pu être authentifiée : ${credentialsError.message}`
    : geocodeError && `L'adresse n'a pas pu être localisée : ${geocodeError.message}`;

  if (error) {
    return (
      <Box sx={AnnotatorStyle}>
        <Typography className='annotator-error'>{error}</Typography>
      </Box>
    );
  }

  if (!accessToken || isLocating || isProjectLoading || isCreditBlocked || (!isNewSession && isDraftLoading)) {
    return <BPLoader message='Chargement des données...' />;
  }

  /**
   * The signed-in Cognito token is the library's whole credential since 0.17.0: every call it makes — the
   * records, the geocoder, the imagery tiles, the roof detection, the 3D generation and the report — goes
   * to the Dashboard API (`apiUrl`) as `Authorization: Bearer`. Nothing else is resolved or handed over,
   * and the imagery resolvers this screen used to own went with it: the library reads the same
   * `/map/layers*` endpoints itself and fetches each cell with that header, so the same-origin WMS proxy
   * the GeoServer's missing CORS headers forced is no longer needed anywhere.
   */
  const config = {
    ...ROOF_ANALYSER_CONFIG,
    accessToken,
    accountId: accountId ?? undefined,
    accountHolderId: accountHolderId ?? undefined,
    userId: userId ?? undefined,
    onBack: () => navigate('/'),
  };

  return (
    <Box sx={AnnotatorStyle}>
      {analysisProject && <AnalysisStatusChips className='annotator-status' project={analysisProject} />}
      <Box className='annotator-content'>
        {sessionId ? (
          <RoofAnnotator
            {...config}
            sessionId={sessionId}
            {...(isNewSession ? {} : { areaPictureId: projectId, annotationId: draftAnnotation?.draftId })}
            {...(position ? { latitude: position.latitude, longitude: position.longitude, address: sessionAddress } : {})}
            {...ROOF_MODEL_OPTIONS}
            {...GEO_SESSION_OPTIONS}
          />
        ) : (
          <RoofAnnotator {...config} areaPictureId={projectId} idAnnotations={draftAnnotation?.draftId} />
        )}
      </Box>
    </Box>
  );
};
