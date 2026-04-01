import { cache, clearPolygons, clearRoofDelimiter, removeCache } from '@/providers';
import { UrlParams } from '@bpartners/annotator-component';
import { AreaPictureDetails, CrupdateAreaPictureDetails } from '@bpartners/typescript-client';
import { useRef, useState } from 'react';
import { useGetOne, useNotify, useUpdate } from 'react-admin';
import { useNavigate } from 'react-router';
import { annotatorStore, useAnnotator3DStore, useAnnotatorComponentStore } from '../store';
import { parseUrlParams } from '../utils';

export const useAreaPictureDetailsFetcher = (mutateMarker?: (areaPictureDetails: AreaPictureDetails) => void) => {
  const { pictureId, prospectId, fileId } = parseUrlParams();
  const notify = useNotify();
  const ref = useRef(new Date().getTime());
  const navigate = useNavigate();
  const { reset: reset3dStore } = useAnnotator3DStore();

  const annotatorComponentStore = useAnnotatorComponentStore();
  const query = useGetOne(
    'area-picture-details',
    { id: pictureId },
    { enabled: !!pictureId, refetchOnWindowFocus: false, queryKeyHashFn: value => JSON.stringify({ value, pictureId, prospectId, fileId }) }
  );
  const [update, { data, isPending, reset }] = useUpdate(
    'area-picture-details',
    { id: pictureId },
    { mutationKey: ['crupdateAreaPictureDetails', query.data, prospectId, fileId, ref.current] }
  );

  const onAreaPictureDetailsError = (error: Error) => {
    const responseErrorMessage = (error as any)?.response?.data?.message;
    if (responseErrorMessage === 'PNEO data is not available yet on this area') notify('messages.areaPicture.noAirbusImage', { type: 'error' });
  };

  const mutate = (crupdateAreaPictureDetails: CrupdateAreaPictureDetails, onSuccess?: () => void): void => {
    if (!query.data || !prospectId || !fileId) return null;
    const areaPictureDetailsToUpdate = {
      ...crupdateAreaPictureDetails,
      address: query.data.address,
      filename: query.data.filename,
      fileId,
      prospectId,
      id: pictureId,
    };

    update(
      'area-picture-details',
      { data: areaPictureDetailsToUpdate, id: ref.current },
      {
        onError: onAreaPictureDetailsError,
        onSuccess: data => {
          onSuccess?.();
          mutateMarker?.(data[0]);
        },
        onSettled() {
          onSuccess?.();
        },
      }
    );
  };

  const [isRebeginLoading, setIsRebeginLoading] = useState(false);

  const rebeginAreaPictureDetails = (): void => {
    reset();
    reset3dStore();
    setIsRebeginLoading(true);
    ref.current = new Date().getTime();
    annotatorStore.useAnnotatorStore.getState().resetAnnotations();
    clearPolygons(true);

    mutate({ ...query.data }, () => {
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

      setIsRebeginLoading(false);
      navigate(`/loading`);
    });
  };

  return {
    query,
    mutateAreaPictureDetails: mutate,
    isLoading: query.isLoading || query.isPending || isPending || isRebeginLoading,
    currentAreaPictureDetailsToUse: data || query.data || { zoom: {} },
    rebeginAreaPictureDetails,
  };
};
