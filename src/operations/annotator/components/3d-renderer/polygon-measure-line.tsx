import { PolygonMeasureResult } from '@/lib/cityjson';
import { Html, Line } from '@react-three/drei';
import { FC } from 'react';
import * as THREE from 'three';
import { polygonMeasureLineStyle as style } from './style';

const EDGE_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#e91e63'];

interface PolygonMeasureLineProps {
  result: PolygonMeasureResult | null;
  points: THREE.Vector3[];
  previewPoint: THREE.Vector3 | null;
}

export const PolygonMeasureLine: FC<PolygonMeasureLineProps> = ({ result, points, previewPoint }) => {
  return (
    <>
      {points.map((p, i) => (
        <mesh key={`pt-${i}`} position={p}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color='#3498db' depthTest={false} />
        </mesh>
      ))}

      {points.length >= 2 &&
        points.map((p, i) => {
          if (i === points.length - 1) return null;
          const a = p;
          const b = points[i + 1];
          const mid = a.clone().add(b).multiplyScalar(0.5);
          mid.y += 0.5;
          const dist = Math.round(a.distanceTo(b) * 100) / 100;
          const flatX = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.z - a.z, 2));
          const slope = Math.round(Math.atan2(Math.abs(b.y - a.y), flatX) * (180 / Math.PI) * 100) / 100;
          const color = EDGE_COLORS[i % EDGE_COLORS.length];

          return (
            <group key={`edge-${i}`}>
              <Line points={[a, b]} color={color} lineWidth={3} depthTest={false} renderOrder={999} />
              <Html position={[mid.x, mid.y, mid.z]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
                <div style={style.measuresContainer}>
                  <span style={style.measureSpan(color)}>{`${dist} m`}</span>
                  <span style={style.measureSpan(color)}>{`${slope}°`}</span>
                </div>
              </Html>
            </group>
          );
        })}

      {points.length > 0 && previewPoint && (
        <Line points={[points[points.length - 1], previewPoint]} color='#ffffff' lineWidth={2} depthTest={false} renderOrder={999} />
      )}

      {result && (
        <>
          {result.edges.map((edge, i) => {
            const mid = edge.pointA.clone().add(edge.pointB).multiplyScalar(0.5);
            mid.y += 0.5;
            const color = EDGE_COLORS[i % EDGE_COLORS.length];
            return (
              <group key={`result-edge-${i}`}>
                <Line points={[edge.pointA, edge.pointB]} color={color} lineWidth={3} depthTest={false} renderOrder={999} />
                <Html position={[mid.x, mid.y, mid.z]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
                  <div style={style.measuresContainer}>
                    <span style={style.measureSpan(color)}>{`${edge.distanceSlope} m`}</span>
                    <span style={style.measureSpan(color)}>{`${edge.slopeAngle}°`}</span>
                  </div>
                </Html>
              </group>
            );
          })}

          {result.points.map((p, i) => (
            <mesh key={`rpt-${i}`} position={p}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshBasicMaterial color='#3498db' depthTest={false} />
            </mesh>
          ))}

          <Html position={[result.centroid.x, result.centroid.y, result.centroid.z]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
            <div style={style.areaDiv}>{`${result.area} m²`}</div>
          </Html>
        </>
      )}
    </>
  );
};
