import { annotatorProvider } from '@/providers';
import { AreaPictureDetails, CrupdateAreaPictureDetails } from '@bpartners/typescript-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNotify } from 'react-admin';
import { parseUrlParams } from '../utils';

export const useAreaPictureDetailsFetcher = (mutateMarker: (areaPictureDetails: AreaPictureDetails) => void) => {
  const { pictureId, prospectId, fileId } = parseUrlParams();
  const notify = useNotify();

  const query = useQuery({
    queryKey: [pictureId, prospectId, fileId],
    queryFn: async () => {
      const areaPictureDetailsResponse = await annotatorProvider.getAreaPictureById(pictureId);
      mutateMarker(areaPictureDetailsResponse);
      return areaPictureDetailsResponse;
    },
    enabled: !!pictureId,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: async (crupdateAreaPictureDetails: CrupdateAreaPictureDetails) => {
      const areaPictureDetailsQueried = query.data;
      if (!areaPictureDetailsQueried || !prospectId || !fileId) return null;

      const areaPictureDetailsResponse = await annotatorProvider.getPictureFormAddress(pictureId, {
        ...crupdateAreaPictureDetails,
        address: areaPictureDetailsQueried.address,
        filename: areaPictureDetailsQueried.filename,
        fileId,
        prospectId,
      });
      mutateMarker(areaPictureDetailsResponse);
      return areaPictureDetailsResponse;
    },
    mutationKey: ['crupdateAreaPictureDetails', query.data, prospectId, fileId],
    onError: error => {
      const responseErrorMessage = (error as any)?.response?.data?.message;
      if (responseErrorMessage === 'PNEO data is not available yet on this area') notify('messages.areaPicture.noAirbusImage', { type: 'error' });
    },
  });

  return { query, mutation };
};
