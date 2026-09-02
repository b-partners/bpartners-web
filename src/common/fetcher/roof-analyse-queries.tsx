import { annotatorProvider, cache, getCached, initializeRoofAnalyse, polygonMapper } from '@/providers';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { useMutation } from '@tanstack/react-query';
import { ErrorMessageDialog } from '../components';
import { useAnalyseCreditPopupStore, useAnnotatorComponentStore } from '../store';
import { useDialog } from '../store/dialog';

export const useInitRoofAnalyseQuery = (address: string, areaPictureDetails: AreaPictureDetails) => {
  const mutationFn = async () => await initializeRoofAnalyse(areaPictureDetails.actualLayer?.name ?? '', address, undefined, undefined);
  return useMutation({ mutationFn, mutationKey: [address, areaPictureDetails] });
};

export const useRoofAnalyseQuery = (polygons: any[], areaPictureDetails: AreaPictureDetails, handleSuccess: () => void) => {
  const { open: openDialog } = useDialog();
  const { setAnalyseInformation, setShouldGetHeightState, setRoofDelimiter, setImageTileInfoOrigin, setAnalyseLoadingPolygon } = useAnnotatorComponentStore();

  const onSuccess = (detectionResult: any) => {
    useAnalyseCreditPopupStore.getState().arm();
    setAnalyseLoadingPolygon(null);
    const geoJsonResultUrl = detectionResult?.result?.geoJsonZone?.[0]?.properties?.vgg_file_url;
    const imageUrl = detectionResult?.result?.geoJsonZone?.[0]?.properties?.original_image_url;
    const roofDelimiter = detectionResult?.result?.roofDelimiter;
    const imageTileInfoOrigin = detectionResult?.result?.imageTileInfoOrigin;
    handleSuccess();
    setShouldGetHeightState(false);
    setAnalyseInformation({ geoJsonResultUrl, imageUrl });
    setRoofDelimiter(roofDelimiter);
    setImageTileInfoOrigin(imageTileInfoOrigin);
  };

  const mutationFn = async () => {
    const imageSize = 1024;
    cache.defaultRoofDelimiter(polygons[0]);
    const mappedCoordinates = (getCached.roofDelimiterLongLatItem() as [number, number][]) || [];

    if (mappedCoordinates.length === 0) {
      const geoJson = polygonMapper.toRefererGeoJson(polygons[0], imageSize, areaPictureDetails);
      const refererGeoJson: any = (await annotatorProvider.pointsToGeoPoints(geoJson as any)) || {};

      const regions = (Object.values(refererGeoJson)[0] as any)?.regions;
      const { all_points_x, all_points_y } = (Object.values(regions)[0] as any)?.shape_attributes || {};

      const coordinates: any[] = [];

      (all_points_x as any[])?.forEach((latitude, index) => {
        coordinates.push({ latitude, longitude: all_points_y[index] });
      });

      if (!refererGeoJson) return null;

      (all_points_x as any[])?.forEach((x, index) => {
        if (index !== all_points_x.length - 1) mappedCoordinates.push([all_points_y[index], x]);
      });

      cache.roofDelimiterLongLatItem(mappedCoordinates);
    }

    setShouldGetHeightState(true);
    return await initializeRoofAnalyse(areaPictureDetails.actualLayer?.name ?? '', `${areaPictureDetails.address}`, [mappedCoordinates], true);
  };

  const mutation = useMutation({
    mutationFn,
    onError: (e: any) => {
      setAnalyseLoadingPolygon(null);
      setShouldGetHeightState(false);
      let errorMessage = 'La détection sur cette zone a échoué, veuillez réessayer';
      if (e.message === 'polygonTooBig') errorMessage = 'La délimitation que vous avez faite est trop grande et ne peut pas encore être prise en charge.';
      if (e.message === 'detectionLimitExceeded') errorMessage = 'La limite des analyses gratuites a été atteinte.';
      if (e.message === 'featureNotAllowed') errorMessage = "Vous n'êtes pas autorisé à effectuer une detection sur cette zone";
      openDialog(<ErrorMessageDialog message={errorMessage} />);
    },
    onSuccess,
  });

  return mutation;
};
