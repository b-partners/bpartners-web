import { AreaPictureDetails, CrupdateAreaPictureDetails } from '@bpartners/typescript-client';
import { useMutation, useQuery } from 'react-query';
import { annotatorProvider } from '@/providers';
import { parseUrlParams } from '../utils';

export const useAreaPictureDetailsFetcher = (mutateMarker: (areaPictureDetails: AreaPictureDetails) => void) => {
  const { pictureId, prospectId, fileId } = parseUrlParams();

  const query = useQuery({
    queryKey: [pictureId],
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
    mutationKey: ['crupdateAreaPictureDetails'],
  });

  return { query, mutation };
};
