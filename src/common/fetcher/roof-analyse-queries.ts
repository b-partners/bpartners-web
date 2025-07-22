import { annotatorProvider, initializeRoofAnalyse, polygonMapper } from '@/providers';
import { AreaPictureDetails, Prospect } from '@bpartners/typescript-client';
import { useMutation } from '@tanstack/react-query';
import getAreaOfPolygon from 'geolib/es/getAreaOfPolygon';
import { getImageSize } from '../utils';

export const useInitRoofAnalyseQuery = (address: string, areaPictureDetails: AreaPictureDetails) => {
  const mutationFn = async () => await initializeRoofAnalyse(areaPictureDetails.actualLayer?.name ?? '', address);
  return useMutation({ mutationFn, mutationKey: [address, areaPictureDetails] });
};

export const useRoofAnalyseQuery = (polygons: any[], areaPictureDetails: AreaPictureDetails, imageSrc: string, prospect: Prospect) => {
  const mutationFn = async () => {
    const imageSize = await getImageSize(imageSrc);
    const geoJson = polygonMapper.toRefererGeoJson(polygons[0], imageSize, areaPictureDetails);
    const refererGeoJson: any = (await annotatorProvider.pointsToGeoPoints(geoJson as any)) || {};

    const regions = (Object.values(refererGeoJson)[0] as any)?.regions;
    const { all_points_x, all_points_y } = (Object.values(regions)[0] as any)?.shape_attributes || {};

    const coordinates: any[] = [];

    (all_points_x as any[])?.forEach((latitude, index) => {
      coordinates.push({ latitude, longitude: all_points_y[index] });
    });

    const area = getAreaOfPolygon(coordinates.pop());
    console.log(area);

    if (!refererGeoJson) return null;

    const mappedCoordinates: number[][] = [];

    (all_points_x as any[])?.forEach((x, index) => {
      if (index !== all_points_x.length - 1) mappedCoordinates.push([all_points_y[index], x]);
    });

    return await initializeRoofAnalyse(
      areaPictureDetails.actualLayer?.name ?? '',
      `${areaPictureDetails.address}`,
      [[mappedCoordinates]],
      prospect.email,
      true
    );
  };

  return useMutation({ mutationFn });
};
