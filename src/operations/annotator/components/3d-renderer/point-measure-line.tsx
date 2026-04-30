import { Html, Line } from '@react-three/drei';
import { PointMeasureResult } from 'cityjson-react';
import { FC } from 'react';
import * as THREE from 'three';
import { pointMeasureLineStyle as style } from './style';

interface PointMeasureLineProps {
  result: PointMeasureResult | null;
  pendingPoint: THREE.Vector3 | null;
}

export const PointMeasureLine: FC<PointMeasureLineProps> = ({ result, pendingPoint }) => {
  return (
    <>
      {pendingPoint && (
        <mesh position={pendingPoint}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color='#3498db' depthTest={false} />
        </mesh>
      )}

      {result && (
        <>
          <mesh position={result.pointA}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color='#3498db' depthTest={false} />
          </mesh>

          <mesh position={result.pointB}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color='#3498db' depthTest={false} />
          </mesh>

          <Line points={[result.pointA, result.pointB]} color='#3498db' lineWidth={3} depthTest={false} renderOrder={999} />

          <Html position={result.pointA.clone().add(result.pointB).multiplyScalar(0.5)} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
            <div style={style.measuresContainer}>
              <span>{result.distanceSlope} m</span>
              <span>{result.slopeAngle}°</span>
            </div>
          </Html>
        </>
      )}
    </>
  );
};
