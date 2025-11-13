import { OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Helper function to apply CityJSON transform to a vertex
const applyTransform = (vertex, transform) => {
  const scale = transform.scale || [1, 1, 1];
  const translate = transform.translate || [0, 0, 0];
  return [vertex[0] * scale[0] + translate[0], vertex[1] * scale[1] + translate[1], vertex[2] * scale[2] + translate[2]];
};

// Helper function to create a shape from a polygon (2D)
function createShapeFromPolygon(polygonIndices, allVertices, transform) {
  const points = [];

  // Filter out duplicate last point if it matches the first
  // This is important for THREE.Shape to correctly detect closed paths
  let uniquePolygonIndices = [...polygonIndices];
  if (uniquePolygonIndices.length > 1 && uniquePolygonIndices[0] === uniquePolygonIndices[uniquePolygonIndices.length - 1]) {
    uniquePolygonIndices.pop();
  }

  uniquePolygonIndices.forEach(idx => {
    const v = allVertices[idx];
    if (v) {
      const transformedV = applyTransform(v, transform);
      // We only need X and Y for the 2D shape
      points.push(new THREE.Vector2(transformedV[0], transformedV[1]));
    }
  });

  if (points.length < 3) return null; // Need at least 3 points for a polygon

  return new THREE.Shape(points);
}

function CityBuilding({ cityObject, allVertices, transform }) {
  const meshRef = useRef();

  let minZ = Infinity;
  let maxZ = -Infinity;
  let basePolygonIndices = null;

  // We need to find the actual ground surface.
  // CityJSON `semantics` can help here.
  // Iterate through all geometries to find the 'GroundSurface' or the lowest surface.
  cityObject.geometry.forEach(geom => {
    if (geom.type === 'MultiSurface' || geom.type === 'Solid') {
      geom.boundaries.forEach((shell, shellIndex) => {
        shell.forEach((polygonIndices, polygonIndex) => {
          // Check if this polygon is explicitly marked as a GroundSurface
          const semanticIdx = geom.semantics?.values?.[shellIndex]; // Adjust if semantics are per polygon
          const surfaceType = geom.semantics?.surfaces?.[semanticIdx]?.type;

          const polygonZValues = polygonIndices.map(idx => {
            const v = allVertices[idx];
            if (v) {
              const transformedV = applyTransform(v, transform);
              return transformedV[2];
            }
            return Infinity;
          });

          const currentMinZ = Math.min(...polygonZValues);
          const currentMaxZ = Math.max(...polygonZValues);

          // If it's a GroundSurface, prioritize it as the base
          if (surfaceType === 'GroundSurface') {
            if (currentMinZ < minZ) {
              // Still pick the lowest ground surface if multiple exist
              minZ = currentMinZ;
              basePolygonIndices = polygonIndices;
            }
          }

          // If no GroundSurface is explicitly found yet, just keep track of the absolute lowest polygon
          if (basePolygonIndices === null && currentMinZ < minZ) {
            minZ = currentMinZ;
            basePolygonIndices = polygonIndices;
          }

          // Always update overall maxZ to get true building height
          maxZ = Math.max(maxZ, currentMaxZ);
        });
      });
    }
  });

  // Fallback if no specific ground surface or lowest polygon found, which shouldn't happen with valid data
  if (!basePolygonIndices || minZ === Infinity || maxZ === -Infinity) {
    console.warn('Could not find a valid base or height for CityObject:', cityObject);
    return null;
  }

  // Use the 'height_in_meters' attribute if available, otherwise calculate from geometry
  const buildingHeight = cityObject.attributes?.height_in_meters || maxZ - minZ;

  if (buildingHeight <= 0) {
    console.warn('Building height is zero or negative for CityObject:', cityObject, 'Calculated height:', maxZ - minZ);
    return null;
  }

  const shape = createShapeFromPolygon(basePolygonIndices, allVertices, transform);

  if (!shape) {
    console.warn('Failed to create shape for CityObject:', cityObject);
    return null;
  }

  const extrudeSettings = {
    steps: 1,
    depth: buildingHeight,
    bevelEnabled: false,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  // Translate to the correct world position, but only for X and Y from the shape.
  // The extrusion depth handles Z.
  // The transform.translate[2] is the *base Z* for the entire city, and minZ is the
  // relative Z for this building's base.
  // So, the final position should be the transform.translate XYZ.
  // ExtrudeGeometry creates the shape from Z=0. We want its base to be at the `transformed minZ`.
  geometry.translate(0, 0, minZ);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial color='gray' />
    </mesh>
  );
}

function CityScene({ data }) {
  if (!data || !data.CityObjects || !data.vertices || !data.transform) {
    console.error('Invalid CityJSON data structure.');
    return null;
  }

  const cityObjects = Object.values(data.CityObjects);
  const { vertices, transform } = data; // Get transform from data

  // Calculate the overall centroid of the entire city to offset the scene,
  // preventing very large world coordinates from causing floating point issues in Three.js.
  let centroidX = 0;
  let centroidY = 0;
  let count = 0;
  data.vertices.forEach(v => {
    const transformedV = applyTransform(v, transform);
    centroidX += transformedV[0];
    centroidY += transformedV[1];
    count++;
  });
  centroidX /= count;
  centroidY /= count;

  // We'll pass this offset to the buildings to render them relative to the center
  const sceneOffset = new THREE.Vector3(centroidX, centroidY, 0);

  return (
    <group position={[-sceneOffset.x, -sceneOffset.y, -sceneOffset.z]}>
      {cityObjects.map((obj, index) => (
        <CityBuilding
          key={obj.id || index} // Use unique ID if available, otherwise index
          cityObject={obj}
          allVertices={vertices}
          transform={transform} // Pass the global transform
        />
      ))}
    </group>
  );
}

export function Annotator3D() {
  const [cityJsonData, setCityJsonData] = useState(null);

  useEffect(() => {
    fetch('/city-json-mock.json')
      .then(res => res.json())
      .then(setCityJsonData);
  }, []);
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [100, 100, 100], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[50, 50, 50]} intensity={1} />
        <directionalLight position={[-50, -50, -50]} intensity={0.5} />
        <CityScene data={cityJsonData} />
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
