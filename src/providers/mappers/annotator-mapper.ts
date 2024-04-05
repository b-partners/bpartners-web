import { Polygon } from '@bpartners/annotator-component';

export const annotatorMapper = (values: any, polygons: Polygon[]) => {
  // mettre ici le vrai type depuis notre client

  return Object.entries(values).map(([index, attributes]) => {
    const polygonIndex = parseInt(index, 10);
    const correspondingPolygon = polygons[polygonIndex];

    return {
      id: correspondingPolygon.id,
      attributes,
      geometry: '',
      polygon: correspondingPolygon,
    };
  });
};
