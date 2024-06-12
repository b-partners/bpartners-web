import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureAnnotation } from '@bpartners/typescript-client';

interface Label {
  id: string;
  name: string;
}
export interface VerifyAdress {
  Longitude: number;
  Latitude: number;
}

export const annotations: Polygon[] = [];

export const invoiceAnnotations: AreaPictureAnnotation[] = [
  {
    id: 'a74ead26-c7f6-46bb-a6ad-c5abda36c20c',
    idAreaPicture: 'b437dfbf-a522-4999-88b2-dd5b66a65d00',
    annotations: [
      {
        id: '312f26d8-f178-4baf-b99d-2567237cd4f3',
        areaPictureId: 'b437dfbf-a522-4999-88b2-dd5b66a65d00',
        annotationId: 'a74ead26-c7f6-46bb-a6ad-c5abda36c20c',
        metadata: {
          area: 10.0,
          slope: 0.0,
          covering: null,
          comment: null,
          fillColor: null,
          strokeColor: null,
          obstacle: null,
          wearLevel: null,
          wearness: null,
          moldRate: null,
        },
        userId: 'ce0c0edb-7d45-4f4f-86d9-363cd5206969',
        labelType: null,
        labelName: 'Polygone A',
        polygon: {
          points: [
            {
              x: 95.0920245398773,
              y: 70.5521472392638,
            },
            {
              x: 59.50920245398773,
              y: 112.26993865030676,
            },
            {
              x: 100.0,
              y: 115.33742331288344,
            },
            {
              x: 95.0920245398773,
              y: 70.5521472392638,
            },
          ],
        },
      },
      {
        id: '07cdb26d-84af-4b54-a73c-c22984b71dbe',
        areaPictureId: 'b437dfbf-a522-4999-88b2-dd5b66a65d00',
        annotationId: 'a74ead26-c7f6-46bb-a6ad-c5abda36c20c',
        metadata: {
          area: 10.0,
          slope: 0.0,
          covering: null,
          comment: null,
          fillColor: null,
          strokeColor: null,
          obstacle: null,
          wearLevel: null,
          wearness: null,
          moldRate: null,
        },
        userId: 'ce0c0edb-7d45-4f4f-86d9-363cd5206969',
        labelType: null,
        labelName: 'Polygone B',
        polygon: {
          points: [
            {
              x: 182.82208588957056,
              y: 144.78527607361963,
            },
            {
              x: 166.87116564417178,
              y: 185.27607361963192,
            },
            {
              x: 188.3435582822086,
              y: 187.73006134969327,
            },
            {
              x: 206.74846625766872,
              y: 165.03067484662577,
            },
            {
              x: 182.82208588957056,
              y: 144.78527607361963,
            },
          ],
        },
      },
    ],
  },
];

export const labels: Label[] = [
  { id: 'roof', name: 'Toit' },
  { id: 'velux', name: 'Velux' },
];
export const covering = [
  { id: 'tuiles', name: 'Tuiles' },
  { id: 'ardoise', name: 'Ardoise' },
  { id: 'beton', name: 'Beton' },
  { id: 'autre', name: 'Autre' },
];

export const verifyAdressResponse: VerifyAdress = {
  Longitude: -73.985428,
  Latitude: 40.748817,
};
