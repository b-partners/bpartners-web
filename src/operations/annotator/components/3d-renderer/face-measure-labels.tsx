import { CityJsonData, useCityJsonMeasure, useCityJsonPanCaptureStore } from '@/lib/cityjson';
import { Billboard, Html, Line, Text } from '@react-three/drei';
import { FC } from 'react';
import * as THREE from 'three';
import { faceMeasureLabelStyle as style } from './style';

interface FaceMeasureLabelsProps {
  mesh: THREE.Mesh | null;
  cityJson: CityJsonData | null;
}

const disableDepth = (textMesh: any) => {
  textMesh.traverse((child: any) => {
    if (child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m: any) => {
        m.depthTest = false;
        m.depthWrite = false;
        m.transparent = true;
      });
    }
  });
};

export const FaceMeasureLabels: FC<FaceMeasureLabelsProps> = ({ mesh, cityJson }) => {
  const { edges, area, centroid } = useCityJsonMeasure(mesh, cityJson);
  const captureMode = useCityJsonPanCaptureStore(state => state.captureMode);

  if (!edges.length) return null;

  return (
    <>
      {edges.map((edge, i) => {
        const outward = new THREE.Vector3().subVectors(edge.midpoint, centroid).normalize().multiplyScalar(0.7);
        const labelPos = edge.midpoint.clone().add(outward);
        return (
          <group key={i}>
            <Line points={[edge.start, edge.end]} color={edge.color} lineWidth={4} depthTest={false} renderOrder={999} />
            <Html position={[edge.midpoint.x, edge.midpoint.y, edge.midpoint.z]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
              <span style={style.distanceMeterSpan(edge)}>{`${edge.distanceMeters} m`}</span>
            </Html>
            <Html position={[centroid.x, centroid.y, centroid.z]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
              <span style={style.areaSpan}>{`${area} m²`}</span>
            </Html>
            {captureMode && (
              <Billboard position={[labelPos.x, labelPos.y, labelPos.z]} renderOrder={9999}>
                <Text
                  fontSize={0.6}
                  color='#ffffff'
                  outlineWidth={0.09}
                  outlineColor='#000000'
                  anchorX='center'
                  anchorY='middle'
                  renderOrder={9999}
                  depthOffset={-1000}
                  onSync={disableDepth}
                >
                  {`${edge.distanceMeters} m`}
                </Text>
              </Billboard>
            )}
          </group>
        );
      })}
      {captureMode && (
        <Billboard position={[centroid.x, centroid.y, centroid.z]} renderOrder={10000}>
          <Text
            fontSize={0.85}
            color='#ffe070'
            outlineWidth={0.1}
            outlineColor='#000000'
            anchorX='center'
            anchorY='middle'
            renderOrder={10000}
            depthOffset={-1000}
            onSync={disableDepth}
          >
            {`${area} m²`}
          </Text>
        </Billboard>
      )}
    </>
  );
};
