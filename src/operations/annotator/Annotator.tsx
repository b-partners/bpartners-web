import { BPLoader } from '@/common/components';
import { parseUrlParams } from '@/common/utils';
import { RoofAnnotator } from '@bpartners/roof-analyser';
import { Box, Typography } from '@mui/material';
import { useGetOne } from 'react-admin';
import { useNavigate, useParams } from 'react-router-dom';
import { readGeoSessionId } from './geo-session';
import { ROOF_ANALYSER_CONFIG } from './roof-analyser-config';
import { AnnotatorStyle } from './style';
import { useGeoPosition } from './use-geo-position';
import { useRoofAnalyserCredentials } from './use-roof-analyser-credentials';
import { resolveWmsLayers } from './wms-resolver';

const readParam = (value?: string) => {
  const trimmed = (value ?? '').trim();
  return trimmed && trimmed !== 'undefined' && trimmed !== 'null' ? trimmed : undefined;
};

export const Annotator = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { address: addressParam, flow } = parseUrlParams();
  const { apiKey, accountId, accountHolderId, userId, error: credentialsError } = useRoofAnalyserCredentials();

  const address = readParam(addressParam);
  const isNewSession = flow === 'geo';
  const { data: draftAnnotation, isLoading: isDraftLoading } = useGetOne('drafts-annotations', { id: projectId }, { enabled: !isNewSession && !!projectId });
  const { position, isLoading: isGeocoding, error: geocodeError } = useGeoPosition(isNewSession ? address : undefined);

  const sessionId = isNewSession ? projectId : readGeoSessionId(draftAnnotation);

  const error = credentialsError
    ? `La clé API du compte n'a pas pu être récupérée : ${credentialsError.message}`
    : geocodeError && `L'adresse n'a pas pu être localisée : ${geocodeError.message}`;

  if (error) {
    return (
      <Box sx={AnnotatorStyle}>
        <Typography className='annotator-error'>{error}</Typography>
      </Box>
    );
  }

  if (!apiKey || isGeocoding || (!isNewSession && isDraftLoading)) {
    return <BPLoader message='Chargement des données...' />;
  }

  const config = {
    ...ROOF_ANALYSER_CONFIG,
    apiKey,
    accountId: accountId ?? undefined,
    accountHolderId: accountHolderId ?? undefined,
    userId: userId ?? undefined,
    onBack: () => navigate('/'),
  };

  return (
    <Box sx={AnnotatorStyle}>
      {sessionId ? (
        <RoofAnnotator
          {...config}
          sessionId={sessionId}
          {...(position ? { latitude: position.latitude, longitude: position.longitude, address } : {})}
          resolveWmsLayers={resolveWmsLayers}
        />
      ) : (
        <RoofAnnotator
          {...config}
          areaPictureId={projectId}
          idAnnotations={draftAnnotation?.draftId}
          address={address ?? draftAnnotation?.areaPicture?.address}
        />
      )}
    </Box>
  );
};
