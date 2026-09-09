import { BPLoader } from '@/common/components';
import { parseUrlParams } from '@/common/utils';
import { RoofAnnotator } from '@bpartners/roof-analyser';
import { Box } from '@mui/material';
import { useGetOne } from 'react-admin';
import { useNavigate, useParams } from 'react-router-dom';
import { ROOF_ANALYSER_CONFIG } from './roof-analyser-config';
import { AnnotatorStyle } from './style';
import { useRoofAnalyserCredentials } from './use-roof-analyser-credentials';

const readAddressParam = (address?: string) => {
  const trimmed = (address ?? '').trim();
  return trimmed && trimmed !== 'undefined' && trimmed !== 'null' ? trimmed : undefined;
};

export const Annotator = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { address, draftAnnotationId } = parseUrlParams();
  const { apiKey, accountId, accountHolderId, userId } = useRoofAnalyserCredentials();

  const addressParam = readAddressParam(address);
  const { data: draftAnnotation, isLoading } = useGetOne('drafts-annotations', { id: projectId }, { enabled: !addressParam && !!projectId });
  const resolvedAddress = addressParam ?? draftAnnotation?.areaPicture?.address;

  if (!apiKey || (!addressParam && isLoading)) {
    return <BPLoader message='Chargement des données...' />;
  }

  return (
    <Box sx={AnnotatorStyle}>
      <RoofAnnotator
        {...ROOF_ANALYSER_CONFIG}
        apiKey={apiKey}
        accountId={accountId ?? undefined}
        accountHolderId={accountHolderId ?? undefined}
        userId={userId ?? undefined}
        address={resolvedAddress}
        areaPictureId={projectId}
        idAnnotations={draftAnnotationId}
        onBack={() => navigate('/')}
      />
    </Box>
  );
};
