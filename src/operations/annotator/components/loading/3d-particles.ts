import * as THREE from 'three';
import { BASE_DEPTH, ORANGE_B, ORANGE_G, ORANGE_R, PARTICLE_COUNT } from './3d-constants';

export interface Particle {
  ox: number;
  oy: number;
  oz: number;
  tx: number;
  ty: number;
  tz: number;
  delay: number;
  size: number;
  dissolveAt: number;
}

export const buildParticles = (pts: { x: number; y: number }[], count: number): Particle[] => {
  const particles: Particle[] = [];
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  const maxR = Math.max(...pts.map(p => Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2)));

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spawnR = maxR * (1.8 + Math.random() * 1.2);
    const ox = cx + Math.cos(angle) * spawnR;
    const oy = cy + Math.sin(angle) * spawnR;
    const oz = -0.1 + Math.random() * (BASE_DEPTH + 0.2);

    let tx: number, ty: number;
    if (Math.random() < 0.6) {
      const ei = Math.floor(Math.random() * pts.length);
      const a = pts[ei],
        b = pts[(ei + 1) % pts.length];
      const f = Math.random();
      tx = a.x + (b.x - a.x) * f;
      ty = a.y + (b.y - a.y) * f;
    } else {
      const xs = pts.map(p => p.x),
        ys = pts.map(p => p.y);
      tx = Math.min(...xs) + Math.random() * (Math.max(...xs) - Math.min(...xs));
      ty = Math.min(...ys) + Math.random() * (Math.max(...ys) - Math.min(...ys));
    }
    const tz = -(Math.random() * BASE_DEPTH);

    particles.push({
      ox,
      oy,
      oz,
      tx,
      ty,
      tz,
      delay: Math.random() * 0.3,
      size: 0.05 + Math.random() * 0.09,
      dissolveAt: 0.7 + Math.random() * 0.2,
    });
  }
  return particles;
};

export const buildCircleTexture = (): THREE.CanvasTexture => {
  const size = 64;
  const cvs = document.createElement('canvas');
  cvs.width = size;
  cvs.height = size;
  const ctx = cvs.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.8)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(cvs);
};

export const buildParticleSystem = (pts: { x: number; y: number }[]) => {
  const particleData = buildParticles(pts, PARTICLE_COUNT);

  const posArr = new Float32Array(PARTICLE_COUNT * 3);
  const colorArr = new Float32Array(PARTICLE_COUNT * 3);

  particleData.forEach((p, i) => {
    posArr[i * 3] = p.ox;
    posArr[i * 3 + 1] = p.oy;
    posArr[i * 3 + 2] = p.oz;
    colorArr[i * 3] = ORANGE_R;
    colorArr[i * 3 + 1] = ORANGE_G;
    colorArr[i * 3 + 2] = ORANGE_B;
  });

  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  partGeo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));

  const circleTex = buildCircleTexture();

  const partMat = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: circleTex },
      uOpacity: { value: 0.0 },
    },
    vertexShader: `
      attribute vec3 color;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 32.0 * (1.0 / -mvPos.z);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float uOpacity;
      varying vec3 vColor;
      void main() {
        vec4 tex = texture2D(map, gl_PointCoord);
        if (tex.a < 0.05) discard;
        gl_FragColor = vec4(vColor, tex.a * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(partGeo, partMat);
  points.renderOrder = 10;

  return { particleData, partGeo, partMat, points, circleTex };
};
