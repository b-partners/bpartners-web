import { FaceEdgeMeasure } from '@/lib/cityjson';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

export interface RoofSurfaceItem {
  index: number;
  area: number;
  slopeDegrees: number;
  edges: FaceEdgeMeasure[];
}

export type EdgeTypeMap = Record<number, Record<number, string>>;

export type Vec3Tuple = [number, number, number];

export interface SavedEdge {
  pointA: Vec3Tuple;
  pointB: Vec3Tuple;
  distanceSlope: number;
  slopeAngle: number;
}

export interface SavedPolygonMeasure {
  id: string;
  name: string;
  area: number;
  points: Vec3Tuple[];
  centroid: Vec3Tuple;
  edges: SavedEdge[];
}

export interface SavedLineMeasure {
  id: string;
  name: string;
  pointA: Vec3Tuple;
  pointB: Vec3Tuple;
  distanceSlope: number;
  slopeAngle: number;
}

interface State {
  roofSurfaces: RoofSurfaceItem[];
  selectedRoofIndex: number | null;
  panNames: Record<number, string>;
  edgeTypes: EdgeTypeMap;
  savedPolygons: SavedPolygonMeasure[];
  savedLines: SavedLineMeasure[];
  selectedMeasureId: string | null;
}

interface Actions {
  setRoofSurfaces: (surfaces: RoofSurfaceItem[]) => void;
  setSelectedRoofIndex: (index: number | null) => void;
  renamePan: (index: number, name: string) => void;
  setPanNames: (names: Record<number, string>) => void;
  setEdgeType: (panIndex: number, edgeIndex: number, typeId: string) => void;
  setEdgeTypes: (edgeTypes: EdgeTypeMap) => void;
  addPolygonMeasure: (polygon: SavedPolygonMeasure) => void;
  removePolygonMeasure: (id: string) => void;
  renamePolygonMeasure: (id: string, name: string) => void;
  addLineMeasure: (line: SavedLineMeasure) => void;
  removeLineMeasure: (id: string) => void;
  renameLineMeasure: (id: string, name: string) => void;
  setSavedPolygons: (polygons: SavedPolygonMeasure[]) => void;
  setSavedLines: (lines: SavedLineMeasure[]) => void;
  setSelectedMeasureId: (id: string | null) => void;
  reset: () => void;
}

const defaultState: State = {
  roofSurfaces: [],
  selectedRoofIndex: null,
  panNames: {},
  edgeTypes: {},
  savedPolygons: [],
  savedLines: [],
  selectedMeasureId: null,
};

const useRoof3DStore = create<State & Actions>(set => ({
  ...defaultState,
  setRoofSurfaces: roofSurfaces => set({ roofSurfaces }),
  setSelectedRoofIndex: selectedRoofIndex => set({ selectedRoofIndex }),
  renamePan: (index, name) => set(state => ({ panNames: { ...state.panNames, [index]: name } })),
  setPanNames: panNames => set({ panNames }),
  setEdgeType: (panIndex, edgeIndex, typeId) =>
    set(state => ({
      edgeTypes: {
        ...state.edgeTypes,
        [panIndex]: { ...(state.edgeTypes[panIndex] ?? {}), [edgeIndex]: typeId },
      },
    })),
  setEdgeTypes: edgeTypes => set({ edgeTypes }),
  addPolygonMeasure: polygon => set(state => ({ savedPolygons: [...state.savedPolygons, polygon] })),
  removePolygonMeasure: id => set(state => ({ savedPolygons: state.savedPolygons.filter(p => p.id !== id) })),
  renamePolygonMeasure: (id, name) => set(state => ({ savedPolygons: state.savedPolygons.map(p => (p.id === id ? { ...p, name } : p)) })),
  addLineMeasure: line => set(state => ({ savedLines: [...state.savedLines, line] })),
  removeLineMeasure: id => set(state => ({ savedLines: state.savedLines.filter(l => l.id !== id) })),
  renameLineMeasure: (id, name) => set(state => ({ savedLines: state.savedLines.map(l => (l.id === id ? { ...l, name } : l)) })),
  setSavedPolygons: savedPolygons => set({ savedPolygons }),
  setSavedLines: savedLines => set({ savedLines }),
  setSelectedMeasureId: selectedMeasureId => set({ selectedMeasureId }),
  reset: () => set({ ...defaultState }),
}));

const useRoofSurfaces = () => useRoof3DStore(useShallow(state => state.roofSurfaces));

const useSelectedRoofIndex = () => useRoof3DStore(state => state.selectedRoofIndex);

const usePanNames = () => useRoof3DStore(useShallow(state => state.panNames));

const useEdgeTypes = () => useRoof3DStore(useShallow(state => state.edgeTypes));

const useSavedPolygons = () => useRoof3DStore(useShallow(state => state.savedPolygons));

const useSavedLines = () => useRoof3DStore(useShallow(state => state.savedLines));

const useSelectedMeasureId = () => useRoof3DStore(state => state.selectedMeasureId);

const useRoof3DActions = () =>
  useRoof3DStore(
    useShallow(state => ({
      setRoofSurfaces: state.setRoofSurfaces,
      setSelectedRoofIndex: state.setSelectedRoofIndex,
      renamePan: state.renamePan,
      setPanNames: state.setPanNames,
      setEdgeType: state.setEdgeType,
      setEdgeTypes: state.setEdgeTypes,
      addPolygonMeasure: state.addPolygonMeasure,
      removePolygonMeasure: state.removePolygonMeasure,
      renamePolygonMeasure: state.renamePolygonMeasure,
      addLineMeasure: state.addLineMeasure,
      removeLineMeasure: state.removeLineMeasure,
      renameLineMeasure: state.renameLineMeasure,
      setSavedPolygons: state.setSavedPolygons,
      setSavedLines: state.setSavedLines,
      setSelectedMeasureId: state.setSelectedMeasureId,
      reset: state.reset,
    }))
  );

export const roof3DStore = {
  useRoof3DStore,
  useRoofSurfaces,
  useSelectedRoofIndex,
  usePanNames,
  useEdgeTypes,
  useSavedPolygons,
  useSavedLines,
  useSelectedMeasureId,
  useRoof3DActions,
};
