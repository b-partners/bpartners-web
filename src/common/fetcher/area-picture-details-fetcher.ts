import { annotatorProvider, cache, clearPolygons, clearRoofDelimiter, removeCache } from '@/providers';
import { UrlParams } from '@bpartners/annotator-component';
import { AreaPictureDetails, CrupdateAreaPictureDetails } from '@bpartners/typescript-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useNotify } from 'react-admin';
import { useNavigate } from 'react-router';
import { annotatorStore, useAnnotatorComponentStore } from '../store';
import { parseUrlParams } from '../utils';

export const useAreaPictureDetailsFetcher = (mutateMarker?: (areaPictureDetails: AreaPictureDetails) => void) => {
  const { pictureId, prospectId, fileId } = parseUrlParams();
  const notify = useNotify();
  const ref = useRef(new Date().getTime());
  const navigate = useNavigate();

  const annotatorComponentStore = useAnnotatorComponentStore();

  const query = useQuery({
    queryKey: [pictureId, prospectId, fileId],
    queryFn: async () => {
      const areaPictureDetailsResponse = await annotatorProvider.getAreaPictureById(pictureId);
      mutateMarker?.(areaPictureDetailsResponse);
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
      mutateMarker?.(areaPictureDetailsResponse);
      return { ...areaPictureDetailsResponse, shiftDirection: crupdateAreaPictureDetails.shiftDirection };
    },
    mutationKey: ['crupdateAreaPictureDetails', query.data, prospectId, fileId, ref.current],
    onError: error => {
      const responseErrorMessage = (error as any)?.response?.data?.message;
      if (responseErrorMessage === 'PNEO data is not available yet on this area') notify('messages.areaPicture.noAirbusImage', { type: 'error' });
    },
  });

  const [isRebeginLoading, setIsRebeginLoading] = useState(false);

  const rebeginAreaPictureDetails = () => {
    ref.current = new Date().getTime();
    setIsRebeginLoading(true);
    annotatorStore.useAnnotatorStore.getState().resetAnnotations();
    clearPolygons(true);

    mutation.mutateAsync({ ...query.data, prospectId: UrlParams.get('prospectId') }).then(() => {
      setIsRebeginLoading(false);

      const fileUrl = UrlParams.get('imgUrl');
      const address = UrlParams.get('address');
      const zoomLevel = UrlParams.get('zoomLevel');
      const pictureId = UrlParams.get('pictureId');
      const prospectId = UrlParams.get('prospectId');
      const fileId = UrlParams.get('fileId');

      removeCache.cityJSONRequestId();
      clearRoofDelimiter();
      annotatorComponentStore.reset();
      cache.loadingRedirection(
        `/annotator?` +
          `imgUrl=${encodeURIComponent(fileUrl)}` +
          `&address=${address}` +
          `&zoomLevel=${zoomLevel}` +
          `&pictureId=${pictureId}` +
          `&useDrafts=false` +
          `&prospectId=${prospectId}` +
          `&fileId=${fileId}`
      );
      navigate(`/loading`);
    });
  };

  return {
    query,
    mutation,
    mutateAreaPictureDetails: mutation.mutate,
    isLoading: query.isLoading || mutation.isPending || isRebeginLoading,
    currentAreaPictureDetailsToUse: mutation.data || query.data || { zoom: {} },
    rebeginAreaPictureDetails,
  };
};
