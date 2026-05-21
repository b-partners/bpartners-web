import { roof3DStore } from '@/common/store';
import { CityJsonData, useCityJsonMeasure } from '@/lib/cityjson';
import { Html, Line } from '@react-three/drei';
import { FC } from 'react';
import * as THREE from 'three';
import { EDGE_TYPE_UNKNOWN_ID, getEdgeType } from './edge-types';
import { faceMeasureLabelStyle as style } from './style';

interface FaceMeasureLabelsProps {
  mesh: THREE.Mesh | null;
  cityJson: CityJsonData | null;
}

export const FaceMeasureLabels: FC<FaceMeasureLabelsProps> = ({ mesh, cityJson }) => {
  const { edges, area, centroid } = useCityJsonMeasure(mesh, cityJson);
  const edgeTypes = roof3DStore.useEdgeTypes();

  if (!edges.length) return null;

  const panIndex = mesh?.userData?.roofIndex as number | undefined;
  const panEdgeTypes = typeof panIndex === 'number' ? edgeTypes[panIndex] : undefined;

  return (
    <>
      {edges.map((edge, i) => {
        const typeId = panEdgeTypes?.[i] ?? EDGE_TYPE_UNKNOWN_ID;
        const color = getEdgeType(typeId).hex;
        return (
          <group key={i}>
            <Line points={[edge.start, edge.end]} color={color} lineWidth={4} depthTest={false} renderOrder={999} />
            <Html position={[edge.midpoint.x, edge.midpoint.y, edge.midpoint.z]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
              <span style={style.distanceMeterSpan({ ...edge, color })}>{`${edge.distanceMeters} m`}</span>
            </Html>
            <Html position={[centroid.x, centroid.y, centroid.z]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
              <span style={style.areaSpan}>{`${area} m²`}</span>
            </Html>
          </group>
        );
      })}
    </>
  );
};
