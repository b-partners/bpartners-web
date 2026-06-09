import { cache, clearPolygons, clearRoofDelimiter, removeCache } from '@/providers';
import { UrlParams } from '@bpartners/annotator-component';
import { AreaPictureDetails, CrupdateAreaPictureDetails } from '@bpartners/typescript-client';
import { useRef, useState } from 'react';
import { useNotify, useUpdate } from 'react-admin';
import { useNavigate } from 'react-router';
import { useCacheImage } from '../hooks';
import { annotatorStore, useAnnotator3DStore, useAnnotatorComponentStore } from '../store';

export const useAreaPictureDetailsFetcher = (mutateMarker?: (areaPictureDetails: AreaPictureDetails) => void) => {
  const notify = useNotify();
  const ref = useRef(new Date().getTime());
  const navigate = useNavigate();
  const { reset: reset3dStore } = useAnnotator3DStore();

  const annotatorComponentStore = useAnnotatorComponentStore();
  const { prospectId, id: pictureId, fileId } = annotatorComponentStore.areaPictureDetails || {};

  const { isCaching: isCachingImage, cacheImage, setIsCaching } = useCacheImage();

  const [update, { data, isPending, reset }] = useUpdate(
    'area-picture-details',
    { id: pictureId },
    {
      mutationKey: ['crupdateAreaPictureDetails', annotatorComponentStore.areaPictureDetails, prospectId, fileId, ref.current],
    }
  );

  const onAreaPictureDetailsError = (error: Error) => {
    const responseErrorMessage = (error as any)?.response?.data?.message;
    if (responseErrorMessage === 'PNEO data is not available yet on this area') notify('messages.areaPicture.noAirbusImage', { type: 'error' });
  };

  const mutate = (crupdateAreaPictureDetails: CrupdateAreaPictureDetails, onSuccess?: () => void): void => {
    if (!prospectId || !fileId) return null;
    setIsCaching(true);
    const areaPictureDetailsToUpdate = {
      ...crupdateAreaPictureDetails,
      fileId,
      prospectId,
      id: pictureId,
    };
    annotatorStore.useAnnotatorStore.getState().replaceAnnotations([], []);
    annotatorStore.useAnnotatorStore.getState().setThreeDGenerationId(undefined);
    removeCache.cityJSONRequestId();
    clearRoofDelimiter();

    update(
      'area-picture-details',
      { data: areaPictureDetailsToUpdate, id: ref.current },
      {
        onError: onAreaPictureDetailsError,
        onSuccess: data => {
          onSuccess?.();
          mutateMarker?.(data[0]);
        },
        onSettled(data) {
          const { fileId: newFileId } = data;
          cacheImage(newFileId, 'AREA_PICTURE', fileId).then(() => annotatorComponentStore.setAreaPictureDetails(data));
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
    annotatorStore.useAnnotatorStore.getState().setThreeDGenerationId(undefined);
    clearPolygons(true);

    mutate({ ...annotatorComponentStore.areaPictureDetails }, () => {
      const fileUrl = UrlParams.get('imgUrl');
      const address = UrlParams.get('address');
      const zoomLevel = UrlParams.get('zoomLevel');
      const pictureId = UrlParams.get('pictureId');
      const draftAnnotationId = UrlParams.get('draftAnnotationId');

      removeCache.cityJSONRequestId();
      clearRoofDelimiter();
      annotatorComponentStore.reset();
      cache.loadingRedirection(
        `/projects/${pictureId}?imgUrl=${encodeURIComponent(fileUrl)}&address=${address}&zoomLevel=${zoomLevel}&pictureId=${pictureId}&useDrafts=true&draftAnnotationId=${draftAnnotationId}`
      );
      setIsRebeginLoading(false);
      navigate(`/loading`);
    });
  };

  return {
    mutateAreaPictureDetails: mutate,
    isLoading: isPending || isRebeginLoading || isCachingImage,
    currentAreaPictureDetailsToUse: data || { zoom: {} },
    rebeginAreaPictureDetails,
  };
};
