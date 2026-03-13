import * as THREE from 'three';
import { BASE_DEPTH, SCANNER_SCALE } from './3d-constants';

export const normalizePoints = (points: { x: number; y: number }[]) => {
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs);
  const minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const cx = (minX + maxX) / 2,
    cy = (minY + maxY) / 2;
  const scale = Math.max(maxX - minX, maxY - minY) / 2 || 1;
  return points.map(p => ({ x: (p.x - cx) / scale, y: (p.y - cy) / scale }));
};

export const ptsToShape = (pts: { x: number; y: number }[], scale = 1) => {
  const shape = new THREE.Shape();
  shape.moveTo(pts[0].x * scale, pts[0].y * scale);
  pts.slice(1).forEach(p => shape.lineTo(p.x * scale, p.y * scale));
  shape.closePath();
  return shape;
};

export const buildShapeGeo = (pts: { x: number; y: number }[], z = 0) => {
  const shape = ptsToShape(pts);
  const geo = new THREE.ShapeGeometry(shape);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, z);
  pos.needsUpdate = true;
  return { geo, shape };
};

export const buildWallGeo = (pts: { x: number; y: number }[], depth: number) => {
  const positions: number[] = [];
  const normals: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i],
      b = pts[(i + 1) % pts.length];
    const dx = b.x - a.x,
      dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dy / len,
      ny = -dx / len;
    positions.push(a.x, a.y, 0, b.x, b.y, 0, b.x, b.y, -depth, a.x, a.y, 0, b.x, b.y, -depth, a.x, a.y, -depth);
    for (let j = 0; j < 6; j++) normals.push(nx, ny, 0);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  return geo;
};

export const buildOutlineGeo = (pts: { x: number; y: number }[], z = 0) => {
  const verts = [...pts.map(p => new THREE.Vector3(p.x, p.y, z))];
  verts.push(verts[0].clone());
  return new THREE.BufferGeometry().setFromPoints(verts);
};

export const buildBoxEdgesGeo = (pts: { x: number; y: number }[]) => {
  const verts: THREE.Vector3[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i],
      b = pts[(i + 1) % pts.length];
    verts.push(
      new THREE.Vector3(a.x, a.y, 0),
      new THREE.Vector3(b.x, b.y, 0),
      new THREE.Vector3(a.x, a.y, -BASE_DEPTH),
      new THREE.Vector3(b.x, b.y, -BASE_DEPTH),
      new THREE.Vector3(a.x, a.y, 0),
      new THREE.Vector3(a.x, a.y, -BASE_DEPTH)
    );
  }
  return new THREE.BufferGeometry().setFromPoints(verts);
};

export const buildScannerGeos = (pts: { x: number; y: number }[]) => {
  const scanGeo = new THREE.ShapeGeometry(ptsToShape(pts, SCANNER_SCALE));
  const glowGeo = new THREE.ShapeGeometry(ptsToShape(pts, SCANNER_SCALE * 1.25));
  return { scanGeo, glowGeo };
};
