import { Polygon } from '@bpartners/annotator-component';
import { Box, Chip, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { FC, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  BASE_DEPTH,
  PALETTE,
  PHASE_EXTRUDE_DURATION,
  PHASE_POLYGON_DURATION,
  PHASE_SCANNER_DELAY,
  ROTATION_SPEED,
  SCAN_BOTTOM,
  SCAN_COLOR,
  SCAN_PERIOD,
  SCAN_TOP,
  STEP_DURATION,
  STEPS,
} from './3d-constants';
import { easeInOut, easeOut, wait } from './3d-easing';
import { buildBoxEdgesGeo, buildOutlineGeo, buildScannerGeos, buildShapeGeo, buildWallGeo, normalizePoints } from './3d-geometry';
import { buildParticleSystem } from './3d-particles';
import { buildScanlineTexture } from './3d-textures';
import { RoofScanLoaderStyle } from './style';

interface RoofScanLoaderProps {
  polygon: Polygon;
  label?: string;
}

export const RoofScanLoader: FC<RoofScanLoaderProps> = props => {
  const { polygon, label = 'Génération du modèle 3D' } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const [dots, setDots] = useState('.');
  const [activeSteps, setActiveSteps] = useState<number[]>([]);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => setDots(d => (d.length >= 3 ? '.' : d + '.')), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const run = async () => {
      for (let i = 0; i < STEPS.length; i++) {
        const step = STEPS[i];
        setActiveSteps(prev => [...prev, step.index]);
        setCurrentStep(step.index);
        if (i < STEPS.length - 1) {
          await wait(STEP_DURATION[i]);
          setDoneSteps(prev => [...prev, step.index]);
          setCurrentStep(null);
          await wait(900);
        }
      }
    };
    run();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || polygon.points.length < 3) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(400, 400);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.sortObjects = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, -3.5, 2.2);
    camera.lookAt(0, 0, -BASE_DEPTH / 2);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xfff8ee, 1.1);
    dir.position.set(3, -3, 5);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xd4e8d4, 0.4);
    fill.position.set(-3, 2, 2);
    scene.add(fill);

    const pts = normalizePoints(polygon.points);

    const { geo: faceGeo } = buildShapeGeo(pts, 0);
    const faceMat = new THREE.MeshPhongMaterial({ color: PALETTE.cream, side: THREE.DoubleSide, transparent: true, opacity: 0 });
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);

    const outlineGeo = buildOutlineGeo(pts, 0.001);
    const outlineMat = new THREE.LineBasicMaterial({ color: PALETTE.pine, transparent: true, opacity: 0 });
    const outlineMesh = new THREE.Line(outlineGeo, outlineMat);

    const wallGeo = buildWallGeo(pts, 0);
    const wallMat = new THREE.MeshPhongMaterial({ color: PALETTE.linen, side: THREE.DoubleSide, shininess: 30, transparent: true, opacity: 0 });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);

    const { geo: botFaceGeo } = buildShapeGeo(pts, 0);
    const botFaceMat = new THREE.MeshPhongMaterial({ color: PALETTE.forest, side: THREE.DoubleSide, transparent: true, opacity: 0 });
    const botFaceMesh = new THREE.Mesh(botFaceGeo, botFaceMat);

    const edgesGeo = buildBoxEdgesGeo(pts);
    const edgesMat = new THREE.LineBasicMaterial({ color: PALETTE.pine, transparent: true, opacity: 0 });
    const edgesMesh = new THREE.LineSegments(edgesGeo, edgesMat);

    const { particleData, partGeo, partMat, points: particlePoints, circleTex } = buildParticleSystem(pts);

    const { scanGeo, glowGeo } = buildScannerGeos(pts);
    const scanlineTex = buildScanlineTexture(8, 1);

    const scanMat = new THREE.MeshBasicMaterial({
      color: SCAN_COLOR,
      map: scanlineTex,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      alphaTest: 0.01,
    });
    const scanMesh = new THREE.Mesh(scanGeo, scanMat);
    scanMesh.renderOrder = 2;

    const glowMat = new THREE.MeshBasicMaterial({
      color: SCAN_COLOR,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.renderOrder = 1;

    const group = new THREE.Group();
    group.add(faceMesh, outlineMesh, wallMesh, botFaceMesh, edgesMesh);
    group.add(scanMesh, glowMesh);
    group.add(particlePoints);
    scene.add(group);

    const wallBase = Array.from(buildWallGeo(pts, 0).attributes.position.array as Float32Array);
    const wallFull = Array.from(buildWallGeo(pts, BASE_DEPTH).attributes.position.array as Float32Array);

    const clock = new THREE.Clock();
    let phase = 0;
    let phaseStart = 0;
    let scanPhaseStart = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      group.rotation.z += ROTATION_SPEED;
      scanlineTex.offset.y = elapsed * 0.35;

      if (phase === 0) {
        const t = Math.min((elapsed - phaseStart) / (PHASE_POLYGON_DURATION / 1000), 1);
        faceMat.opacity = easeOut(t);
        outlineMat.opacity = easeOut(t);
        if (t >= 1) {
          phase = 1;
          phaseStart = elapsed;
        }
      }

      if (phase === 1) {
        const t = Math.min((elapsed - phaseStart) / (PHASE_EXTRUDE_DURATION / 1000), 1);
        const depth = easeOut(t) * BASE_DEPTH;

        const pos = wallGeo.attributes.position as THREE.BufferAttribute;
        const arr = pos.array as Float32Array;
        for (let i = 0; i < wallFull.length; i++) {
          arr[i] = i % 3 === 2 && wallFull[i] < 0 ? -depth : wallBase[i];
        }
        pos.needsUpdate = true;

        const bpos = botFaceMesh.geometry.attributes.position as THREE.BufferAttribute;
        const barr = bpos.array as Float32Array;
        for (let i = 2; i < barr.length; i += 3) barr[i] = -depth;
        bpos.needsUpdate = true;

        const epos = edgesGeo.attributes.position as THREE.BufferAttribute;
        const earr = epos.array as Float32Array;
        for (let i = 2; i < earr.length; i += 3) {
          if (earr[i] < 0) earr[i] = -depth;
        }
        epos.needsUpdate = true;

        const fade = easeOut(Math.min(t * 2, 1));
        wallMat.opacity = fade * 0.82;
        botFaceMat.opacity = fade * 0.82;
        edgesMat.opacity = fade;
        faceMat.opacity = 1;
        outlineMat.opacity = 0;

        const particlePhase = Math.min(t / 0.92, 1);
        (partMat.uniforms.uOpacity as any).value =
          particlePhase < 0.08 ? easeOut(particlePhase / 0.08) : particlePhase > 0.85 ? 1 - easeOut((particlePhase - 0.85) / 0.15) : 1;

        const pPosArr = partGeo.attributes.position.array as Float32Array;
        particleData.forEach((p, i) => {
          const localT = Math.max(0, Math.min((particlePhase - p.delay) / (1 - p.delay), 1));
          const eased = easeInOut(localT);
          pPosArr[i * 3] = p.ox + (p.tx - p.ox) * eased;
          pPosArr[i * 3 + 1] = p.oy + (p.ty - p.oy) * eased;
          pPosArr[i * 3 + 2] = p.oz + (p.tz - p.oz) * eased;
        });
        partGeo.attributes.position.needsUpdate = true;

        if (t >= 1) {
          phase = 2;
          phaseStart = elapsed;
          scanPhaseStart = elapsed + PHASE_SCANNER_DELAY / 1000;
          (partMat.uniforms.uOpacity as any).value = 0;
        }
      }

      if (phase === 2 && elapsed >= scanPhaseStart) {
        const t = elapsed - scanPhaseStart;
        const sweep = (t % SCAN_PERIOD) / SCAN_PERIOD;
        const tri = sweep < 0.5 ? sweep * 2 : 2 - sweep * 2;
        const scanZ = SCAN_TOP + tri * (SCAN_BOTTOM - SCAN_TOP);

        scanMesh.position.z = scanZ;
        glowMesh.position.z = scanZ;

        const pulse = 0.6 + 0.4 * Math.sin(elapsed * 10);
        scanMat.opacity = 0.75 * pulse;
        glowMat.opacity = 0.35 * pulse;
      }

      renderer.render(scene, camera);
    };

    clock.start();
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      scanlineTex.dispose();
      circleTex.dispose();
      renderer.dispose();
    };
  }, [polygon]);

  return (
    <Box sx={RoofScanLoaderStyle}>
      <Box className='steps-row'>
        {STEPS.filter(s => activeSteps.includes(s.index)).map(step => {
          const isDone = doneSteps.includes(step.index);
          const isCurrent = currentStep === step.index;
          return (
            <motion.div
              key={step.index}
              className='chip-wrapper'
              initial={{ width: 32, opacity: 0 }}
              animate={{ width: isDone ? 32 : 'auto', opacity: 1 }}
              transition={{ duration: isDone ? 1.1 : 0.5, ease: 'easeInOut' }}
            >
              <motion.div className='chip-morph' animate={{ borderRadius: isDone ? '50%' : '16px' }} transition={{ duration: 0.6, ease: 'easeInOut' }}>
                <Chip
                  label={
                    <span className='chip-content'>
                      <span className='chip-index'>{step.index}</span>
                      {!isDone && (
                        <motion.span
                          className='chip-label'
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
                          {step.label}
                        </motion.span>
                      )}
                    </span>
                  }
                  className={['step-chip', isDone ? 'step-chip--done' : '', isCurrent ? 'step-chip--current' : ''].filter(Boolean).join(' ')}
                />
                {isCurrent && (
                  <motion.div
                    className='shimmer-overlay'
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.3 }}
                  />
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </Box>
      <Box className='canvas-wrapper'>
        <canvas ref={canvasRef} width={400} height={400} />
      </Box>
      <Typography className='label'>
        {label}
        <span className='dots'>{dots}</span>
      </Typography>
    </Box>
  );
};
