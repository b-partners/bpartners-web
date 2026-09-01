import { SavedLineMeasure, SavedPolygonMeasure } from '@/common/store';
import { Point } from '@bpartners/typescript-client';
import { CityJSON } from '../city-json-type';
import { cityJsonMapper } from './city-json-mapper';

// A non-trivial, per-axis transform (distinct scale/translate on X and Y) so a test passing
// here can't hide a scale/translate mismatch the way scale=[1,1,1] translate=[0,0,0] would.
// boundaryMapper.toPan ignores this transform entirely and reads raw vertex values * 0.001,
// so manually drawn polygons must land on that exact same raw*0.001 footprint scale once the
// transform is unwound, not on the transform-applied "real" scale.
//
// Raw square footprint: [1000,2000] [1400,2000] [1400,2150] [1000,2150] (z=500 throughout).
// real = raw*scale + translate ⇒ centroid (mean of real vertices) = [112, 241.5, 5].
// Also exposed as a RoofSurface so tests can compare a manually drawn polygon against the
// pan auto-detected from that same surface.
const cityJson: CityJSON = {
  type: 'CityJSON',
  version: '1.1',
  transform: { scale: [0.01, 0.02, 0.01], translate: [100, 200, 0] },
  vertices: [
    [1000, 2000, 500],
    [1400, 2000, 500],
    [1400, 2150, 500],
    [1000, 2150, 500],
  ],
  CityObjects: {
    roof1: {
      type: 'Building',
      geometry: [
        {
          type: 'MultiSurface',
          boundaries: [[[0, 1, 2, 3]]],
          semantics: {
            surfaces: [{ type: 'RoofSurface', slope_in_degrees: 0, area_in_square_meters: 5.1 }],
            values: [0],
          },
        },
      ],
    },
  },
};

const polygonMeasure = (points: SavedPolygonMeasure['points']): SavedPolygonMeasure => ({
  id: 'polygon-1',
  name: 'Polygone 1',
  area: 12,
  points,
  centroid: points[0],
  edges: [],
});

const lineMeasure = (pointA: SavedLineMeasure['pointA'], pointB: SavedLineMeasure['pointB']): SavedLineMeasure => ({
  id: 'line-1',
  name: 'Ligne 1',
  pointA,
  pointB,
  distanceSlope: 3,
  slopeAngle: 12,
});

describe('cityJsonMapper.userPolygonToPan', () => {
  it('maps a raycasted point sitting exactly on a CityJSON vertex back onto that vertex raw*0.001 footprint', () => {
    // Forward transform for raw vertex [1000, 2000, 500] (real = [110, 240, 5]):
    // three = [real.x - center.x, real.z - center.z, -(real.y - center.y)] = [-2, 0, 1.5]
    const pan = cityJsonMapper.userPolygonToPan(polygonMeasure([[-2, 0, 1.5]]), cityJson);

    // boundaryMapper.toPan would compute this same vertex as raw*0.001 = [1, 2], regardless
    // of the transform above — this is the invariant the whole fix depends on.
    expect(pan.polygon.points[0].x).to.be.closeTo(1, 1e-9);
    expect(pan.polygon.points[0].y).to.be.closeTo(2, 1e-9);
  });

  it('maps two raycasted points to their respective raw*0.001 footprints and closes the ring', () => {
    const pan = cityJsonMapper.userPolygonToPan(
      polygonMeasure([
        [-2, 0, 1.5], // raw vertex [1000, 2000, 500] -> [1, 2]
        [2, 0, 1.5], // raw vertex [1400, 2000, 500] -> [1.4, 2]
      ]),
      cityJson
    );

    expect(pan.polygon.points).to.have.length(3);
    expect(pan.polygon.points[0].x).to.be.closeTo(1, 1e-9);
    expect(pan.polygon.points[0].y).to.be.closeTo(2, 1e-9);
    expect(pan.polygon.points[1].x).to.be.closeTo(1.4, 1e-9);
    expect(pan.polygon.points[1].y).to.be.closeTo(2, 1e-9);
    expect(pan.polygon.points[2]).to.deep.equal(pan.polygon.points[0]);
  });

  it('falls back to a naive axis mapping when no CityJSON model is available', () => {
    const pan = cityJsonMapper.userPolygonToPan(polygonMeasure([[2, 0, -3]]));

    expect(pan.polygon.points).to.deep.equal([
      { x: 2, y: -3 },
      { x: 2, y: -3 },
    ]);
  });

  it('carries the imageUri through when provided', () => {
    const pan = cityJsonMapper.userPolygonToPan(polygonMeasure([[0, 0, 0]]), cityJson, 'file-id');

    expect(pan.imageUri).to.eq('file-id');
  });

  it('still recenters around the model centroid when the CityJSON payload has no transform block', () => {
    const cityJsonWithoutTransform = {
      type: 'CityJSON',
      version: '1.1',
      vertices: [
        [0, 0, 0],
        [10, 0, 0],
        [10, 10, 0],
        [0, 10, 0],
      ],
      CityObjects: {},
    } as unknown as CityJSON;

    // centroid = [5, 5, 0]; three.js hit [2, 0, -3] -> real (7, 8) -> footprint = real * 0.001
    const pan = cityJsonMapper.userPolygonToPan(polygonMeasure([[2, 0, -3]]), cityJsonWithoutTransform);

    expect(pan.polygon.points[0].x).to.be.closeTo(0.007, 1e-9);
    expect(pan.polygon.points[0].y).to.be.closeTo(0.008, 1e-9);
  });
});

describe('cityJsonMapper.userLineToPan', () => {
  it('maps both endpoints onto their raw*0.001 footprints', () => {
    const pan = cityJsonMapper.userLineToPan(lineMeasure([-2, 0, 1.5], [2, 0, 1.5]), cityJson);

    expect(pan.polygon.points).to.have.length(2);
    expect(pan.polygon.points[0].x).to.be.closeTo(1, 1e-9);
    expect(pan.polygon.points[0].y).to.be.closeTo(2, 1e-9);
    expect(pan.polygon.points[1].x).to.be.closeTo(1.4, 1e-9);
    expect(pan.polygon.points[1].y).to.be.closeTo(2, 1e-9);
  });
});

// This is the regression scenario for the original bug: a user manually traces a polygon
// over the exact same roof face CityJSON already auto-detected. Before the fix, the manual
// polygon's footprint lived in a different plane/scale than the auto-detected pan's, so the
// two would neither overlap nor even point the same way once drawn together. A "flat" roof
// (all vertices sharing one Z) keeps boundaryMapper.toPan's footprint free of the extra
// edge-length rescaling it applies to sloped pans, so the auto-detected footprint is a
// direct, easy-to-reason-about raw*0.001 projection of the same 4 vertices.
describe('cityJsonMapper — manually drawn polygon identical to an auto-detected pan', () => {
  const edgeVector = (points: Point[], index: number) => ({
    x: (points[index + 1].x ?? 0) - (points[index].x ?? 0),
    y: (points[index + 1].y ?? 0) - (points[index].y ?? 0),
  });
  // 2D cross product: ~0 means the two vectors point along the same line (parallel, same or opposite direction).
  const cross = (a: Point, b: Point) => (a.x ?? 0) * (b.y ?? 0) - (a.y ?? 0) * (b.x ?? 0);

  it('produces a footprint parallel to, and coincident with, the pan auto-detected from the same roof surface', () => {
    const { pans } = cityJsonMapper.toExportAreaPictureAnnotation3D(cityJson);
    const autoPanPoints = pans[0].polygon.points;

    // Raycasted three.js hits for the exact same 4 raw vertices the roof surface uses, in the
    // same order: [1000,2000,500], [1400,2000,500], [1400,2150,500], [1000,2150,500].
    const manualPan = cityJsonMapper.userPolygonToPan(
      polygonMeasure([
        [-2, 0, 1.5],
        [2, 0, 1.5],
        [2, 0, -1.5],
        [-2, 0, -1.5],
      ]),
      cityJson
    );
    const manualPanPoints = manualPan.polygon.points;

    expect(autoPanPoints).to.have.length(5); // 4 vertices + the ring closing back to the first
    expect(manualPanPoints).to.have.length(5);

    for (let i = 0; i < 4; i++) {
      const autoEdge = edgeVector(autoPanPoints, i);
      const manualEdge = edgeVector(manualPanPoints, i);

      // Parallel: the manual polygon's edges point the same way as the auto-detected pan's.
      expect(cross(autoEdge, manualEdge), `edge ${i} should be parallel`).to.be.closeTo(0, 1e-6);
      // Identical: the two polygons don't just point the same way, they sit in the exact same place.
      expect(manualPanPoints[i].x ?? 0, `point ${i}.x`).to.be.closeTo(autoPanPoints[i].x ?? 0, 1e-6);
      expect(manualPanPoints[i].y ?? 0, `point ${i}.y`).to.be.closeTo(autoPanPoints[i].y ?? 0, 1e-6);
    }
  });
});
