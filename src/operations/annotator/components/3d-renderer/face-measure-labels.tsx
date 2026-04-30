import { Html, Line } from '@react-three/drei';
import { CityJsonData, useCityJsonMeasure } from 'cityjson-react';
import { FC } from 'react';
import * as THREE from 'three';
import { faceMeasureLabelStyle as style } from './style';

interface FaceMeasureLabelsProps {
  mesh: THREE.Mesh | null;
  cityJson: CityJsonData | null;
}

export const FaceMeasureLabels: FC<FaceMeasureLabelsProps> = ({ mesh, cityJson }) => {
  const { edges, area, centroid } = useCityJsonMeasure(mesh, cityJson);

  if (!edges.length) return null;

  return (
    <>
      {edges.map((edge, i) => (
        <group key={i}>
          <Line points={[edge.start, edge.end]} color={edge.color} lineWidth={4} depthTest={false} renderOrder={999} />
          <Html position={[edge.midpoint.x, edge.midpoint.y, edge.midpoint.z]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
            <span style={style.distanceMeterSpan(edge)}>{`${edge.distanceMeters} m`}</span>
          </Html>
          <Html position={[centroid.x, centroid.y, centroid.z]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
            <span style={style.areaSpan}>{`${area} m²`}</span>
          </Html>
        </group>
      ))}
    </>
  );
};
