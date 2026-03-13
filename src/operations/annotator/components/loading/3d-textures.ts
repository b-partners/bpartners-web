import * as THREE from 'three';

export const buildScanlineTexture = (lineGap = 8, lineWidth = 1): THREE.CanvasTexture => {
  const size = 256;
  const cvs = document.createElement('canvas');
  cvs.width = size;
  cvs.height = size;
  const ctx = cvs.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = 'rgba(255,255,255,1)';
  for (let y = 0; y < size; y += lineGap) ctx.fillRect(0, y, size, lineWidth);
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
};
