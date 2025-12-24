import { ConverterPayloadGeoJSON, Geometry } from '@/operations/annotator';
import { Point, Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails, GeoPosition } from '@bpartners/typescript-client';
import { v4 } from 'uuid';
import { ShapeAttributes } from './roof-analyse-mapper';

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

const coordinatesToShapeAttributes = (coordinates: any[][]) => {
  const res: any = { all_points_x: [], all_points_y: [], name: 'polygon' };

  coordinates[0][0].forEach(([lng, lat]: [number, number]) => {
    res.all_points_x.push(lng);
    res.all_points_y.push(lat);
  });

  return res;
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
  toRefererGeoJson(polygon: Polygon, _image_size: number, areaPicture: AreaPictureDetails) {
    const filename = `${v4().replace(/\-/gi, '')}_${areaPicture.zoom.number}_${(areaPicture.xTile || 0) - 1}_${(areaPicture.yTile || 0) - 1}.jpg`;

    const image_size = _image_size > 1024 ? 1024 : _image_size;

    const result: any = {
      size: image_size,
      filename,
      zoom: areaPicture.zoom.number,
      regions: {},
      base64_img_data: null,
    };

    const offsets =
      !areaPicture.isExtended && areaPicture.actualLayer.name !== 'FLUX_IGN_2023_20CM' ? { x: areaPicture.xOffset, y: areaPicture.yOffset } : { x: 0, y: 0 };

    console.log({ offsets });

    result.regions = {
      '1': {
        shape_attributes: toGeoShapeAttributes(polygon, offsets),
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
  toPixelGeoJson(feature: any[], x: number, y: number, size: number, zoom: number) {
    const filename = `${v4().replace(/\-/gi, '')}_${zoom}_${x}_${y}.jpg`;
    const result: any = {
      size,
      filename,
      zoom: 20,
      regions: {},
      base64_img_data: null,
    };

    feature.forEach(({ geometry: { coordinates }, properties: { label } }, index) => {
      const region = {
        shape_attributes: coordinatesToShapeAttributes(coordinates),
        region_attributes: {
          label,
          confidence: 0.7055366635322571,
        },
      };
      result.regions[index] = region;
    });

    return {
      [filename]: result,
    };
  },
};

export const geoShapeAttributesToPoints = (shapeAttributes: ShapeAttributes) => {
  const points: Point[] = [];

  shapeAttributes.all_points_x.forEach((x, index) => {
    points.push({ x: x, y: shapeAttributes.all_points_y[index] });
  });

  return points;
};
