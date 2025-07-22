import { ConverterPayloadGeoJSON, Geometry } from '@/operations/annotator';
import { Point, Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails, GeoPosition } from '@bpartners/typescript-client';
import { v4 } from 'uuid';

type GeoPolygonToRestMetaData = {
  filename: string;
  image_size: number;
  x_tile: number;
  y_tile: number;
  zoom: number;
};

const toGeoShapeAttributes = (polygon: Polygon, offsets: Point) => {
  const shapeAttributes: any = {
    all_points_x: [],
    all_points_y: [],
    name: 'polygon',
  };
  polygon.points.forEach(({ x, y }) => {
    shapeAttributes.all_points_x.push(x + offsets.x);
    shapeAttributes.all_points_y.push(y + offsets.y);
  });
  return shapeAttributes;
};

export const polygonMapper = {
  toRest(geoPositions: GeoPosition[], metadata: GeoPolygonToRestMetaData) {
    const geometry: Geometry = {
      coordinates: [[[...geoPositions.map(({ latitude, longitude }) => [longitude, latitude])]]],
      type: 'MultiPolygon',
    };

    const res: ConverterPayloadGeoJSON = {
      ...metadata,
      properties: {
        id: '',
      },
      region_attributes: {
        label: 'pathway',
      },
      geometry,
      type: 'Feature',
    };

    return res;
  },
  toRefererGeoJson(polygon: Polygon, image_size: number, areaPicture: AreaPictureDetails) {
    const filename = `${v4().replace(/\-/gi, '')}_20_${(areaPicture.xTile || 0) - 1}_${(areaPicture.yTile || 0) - 1}.jpg`;

    const result: any = {
      size: image_size,
      filename,
      zoom: 20,
      regions: {},
      base64_img_data: null,
    };

    result.regions = {
      '1': {
        shape_attributes: toGeoShapeAttributes(polygon, { x: 0, y: 0 }),
        region_attributes: {
          label: 'polygon',
          confidence: 0.7055366635322571,
        },
      },
    };

    return {
      [filename]: result,
    };
  },
};
