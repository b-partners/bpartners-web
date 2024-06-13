
const availableLayers = [
  {
    id: 'cee23f9b-d3ca-4a47-b27a-d7d62b5119c7',
    name: 'vendee',
    year: 2023,
    source: 'GEOSERVER',
    departementName: 'vendee',
    maximumZoomLevel: 'HOUSES_0',
    maximumZoom: {
      level: 'HOUSES_0',
      number: 20,
    },
    precisionLevelInCm: 20,
  },
  {
    id: '2cb589c1-45b0-4cb8-b84e-f1ed40e97bd8',
    name: 'tous_fr',
    year: 0,
    source: 'OPENSTREETMAP',
    departementName: 'ALL',
    maximumZoomLevel: 'HOUSES_0',
    maximumZoom: {
      level: 'HOUSES_0',
      number: 20,
    },
    precisionLevelInCm: 20,
  },
];

export const areaPictures = {
  id: '8631544e-f84e-47bb-9601-5baeee5062c5',
  xTile: 519192,
  yTile: 370917,
  availableLayers: ['tous_fr'],
  actualLayer: {
    id: 'cee23f9b-d3ca-4a47-b27a-d7d62b5119c7',
    name: 'vendee',
    year: 2023,
    source: 'GEOSERVER',
    departementName: 'vendee',
    maximumZoomLevel: 'HOUSES_0',
    maximumZoom: {
      level: 'HOUSES_0',
      number: 20,
    },
    precisionLevelInCm: 20,
  },
  otherLayers: availableLayers,
  address: "25 Rue Camille Guérin, 85180 Les Sables-d'Olonne",
  zoomLevel: 'HOUSES_0',
  zoom: {
    level: 'HOUSES_0',
    number: 20,
  },
  fileId: 'areaPictures-file-id',
  filename: 'vendee_HOUSES_0_519192_370917',
  prospectId: 'b42c4eeb-30d9-463e-bb8e-b7378bd957a6',
  createdAt: '2024-05-28T12:34:54.897272Z',
  updatedAt: '2024-05-28T12:34:54.897319Z',
  layer: 'tous_fr',
};

export const areaPicturesBuildingZoom = {
  ...areaPictures,
  zoom: { level: 'BUILDING', number: 19 },
  zoomLevel: 'BUILDING',
  fileId: 'areaPicturesBuildingZoom-file-id',
};
export const areaPicturesBuildingZoomTousFrLayer = {
  ...areaPictures,
  zoom: { level: 'BUILDING', number: 19 },
  zoomLevel: 'BUILDING',
  actualLayer: availableLayers[1],
  fileId: 'areaPicturesBuildingZoomTousFrLayer-file-id',
};

export const areaPicturesBuildingZoomTousFrLayerExtended = {
  ...areaPictures,
  zoom: { level: 'BUILDING', number: 19 },
  zoomLevel: 'BUILDING',
  actualLayer: availableLayers[1],
  isExtended: true,
  fileId: 'areaPicturesBuildingZoomTousFrLayer-file-id',
};
