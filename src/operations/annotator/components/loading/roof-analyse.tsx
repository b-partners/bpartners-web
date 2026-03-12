import { Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { FC, useEffect, useRef, useState } from 'react';
import { RoofAnalysisDialogStyle } from './style';

interface Point {
  x: number;
  y: number;
}

interface RoofAnalysisDialogProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  polygon: Point[];
  onAnalysisComplete?: () => void;
}

const PALETTE = {
  pine: '#4A644E',
  peach: '#FFB179',
  linen: '#BEB4A4',
  white: '#FFFFFF',
  black: '#1F1F1F',
  cream: '#F0ECE1',
  forest: '#112717',
  neon_orange: '#FF521B',
};

const CONFIG = {
  canvas: {
    width: 554,
    height: 400,
  },
  colors: {
    bg: '#ffffff',
    polygonStroke: '#00ff00',
    polygonGlow: PALETTE.pine,
    scanLine: PALETTE.peach,
    scanGlow: PALETTE.peach,
    scanFade: 'rgba(255,177,121,0.10)',
    overlayFill: 'rgba(74,100,78,0.18)',
    overlayStroke: PALETTE.pine,
    pulseStroke: PALETTE.neon_orange,
    pulseGlow: PALETTE.neon_orange,
  },
  durations: {
    pixelReveal: 10000,
    polygonDraw: 5000,
    zoomIn: 900,
    analysis: 8000,
  },
  sizes: {
    pixelSize: 12,
    polygonLineWidth: 2.5,
    polygonDash: [7, 4] as number[],
    scanLineWidth: 2,
    zoomPadding: 44,
  },
  speeds: {
    pulseFrequency: 0.003,
    pulseAmplitude: 5,
  },
  overlayEveryMs: 1200,
};

const STEPS = [
  { index: 1, label: "Envoi de l'image au serveur IA" },
  { index: 2, label: 'Récupération de la délimitation' },
  { index: 3, label: 'Analyse de la toiture en cours' },
];

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export const RoofAnalysisDialog: FC<RoofAnalysisDialogProps> = props => {
  const { imageUrl, imageWidth, imageHeight, polygon } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [activeSteps, setActiveSteps] = useState<number[]>([1]);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<number | null>(1);

  const { colors, durations, sizes, speeds } = CONFIG;
  const CW = CONFIG.canvas.width;
  const CH = CONFIG.canvas.height;

  const scale = Math.min(CW / imageWidth, CH / imageHeight, 1);
  const IW = Math.round(imageWidth * scale);
  const IH = Math.round(imageHeight * scale);
  const offsetX = Math.round((CW - IW) / 2);
  const offsetY = Math.round((CH - IH) / 2);

  const scaledPoly = polygon.map(p => ({
    x: p.x * scale + offsetX,
    y: p.y * scale + offsetY,
  }));

  const polyBounds = {
    minX: Math.min(...scaledPoly.map(p => p.x)),
    maxX: Math.max(...scaledPoly.map(p => p.x)),
    minY: Math.min(...scaledPoly.map(p => p.y)),
    maxY: Math.max(...scaledPoly.map(p => p.y)),
  };
  const polyCX = (polyBounds.minX + polyBounds.maxX) / 2;
  const polyCY = (polyBounds.minY + polyBounds.maxY) / 2;
  const polyW = polyBounds.maxX - polyBounds.minX + sizes.zoomPadding * 2;
  const polyH = polyBounds.maxY - polyBounds.minY + sizes.zoomPadding * 2;
  const targetZoom = Math.min(CW / polyW, CH / polyH, 3.2);

  const applyZoom = (ctx: CanvasRenderingContext2D, zoom: number) => {
    const t = (zoom - 1) / (targetZoom - 1);
    const cx = CW / 2 + (polyCX - CW / 2) * t; // lerp from canvas center to polyCX
    const cy = CH / 2 + (polyCY - CH / 2) * t;
    ctx.translate(CW / 2, CH / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-cx, -cy);
  };

  const drawBaseImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, zoom = 1) => {
    ctx.save();
    applyZoom(ctx, zoom);
    ctx.drawImage(img, offsetX, offsetY, IW, IH);
    ctx.restore();
  };

  const drawPolygonStroke = (ctx: CanvasRenderingContext2D, zoom: number, progress = 1, lineWidth = sizes.polygonLineWidth) => {
    const totalLength = scaledPoly.reduce((acc, p, i) => {
      const next = scaledPoly[(i + 1) % scaledPoly.length];
      return acc + Math.hypot(next.x - p.x, next.y - p.y);
    }, 0);
    const targetLength = progress * totalLength;
    let drawn = 0;

    ctx.save();
    applyZoom(ctx, zoom);
    ctx.beginPath();
    ctx.moveTo(scaledPoly[0].x, scaledPoly[0].y);
    for (let i = 0; i < scaledPoly.length; i++) {
      const next = scaledPoly[(i + 1) % scaledPoly.length];
      const segLen = Math.hypot(next.x - scaledPoly[i].x, next.y - scaledPoly[i].y);
      if (drawn + segLen >= targetLength) {
        const st = (targetLength - drawn) / segLen;
        ctx.lineTo(scaledPoly[i].x + (next.x - scaledPoly[i].x) * st, scaledPoly[i].y + (next.y - scaledPoly[i].y) * st);
        break;
      }
      ctx.lineTo(next.x, next.y);
      drawn += segLen;
    }
    ctx.strokeStyle = colors.polygonStroke;
    ctx.lineWidth = lineWidth / zoom;
    ctx.setLineDash(sizes.polygonDash);
    ctx.shadowColor = colors.polygonGlow;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
    ctx.restore();
  };

  const drawOverlayLayers = (ctx: CanvasRenderingContext2D, zoom: number, scanProgress: number) => {
    if (scanProgress <= 0) return;
    const scanY = polyBounds.minY + scanProgress * (polyBounds.maxY - polyBounds.minY);

    ctx.save();
    applyZoom(ctx, zoom);

    ctx.beginPath();
    scaledPoly.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = 'rgba(255,177,121,0.35)';
    ctx.fillRect(polyBounds.minX - sizes.zoomPadding, polyBounds.minY - sizes.zoomPadding, polyW, scanY - (polyBounds.minY - sizes.zoomPadding));

    ctx.restore();
  };

  const drawScanLine = (ctx: CanvasRenderingContext2D, zoom: number, scanY: number) => {
    ctx.save();
    applyZoom(ctx, zoom);

    ctx.beginPath();
    scaledPoly.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.clip();

    const grad = ctx.createLinearGradient(0, scanY - 80, 0, scanY + 4);
    grad.addColorStop(0, 'rgba(255,177,121,0)');
    grad.addColorStop(0.6, 'rgba(255,177,121,0.15)');
    grad.addColorStop(1, 'rgba(255,177,121,0.4)');
    ctx.fillStyle = grad;
    ctx.fillRect(polyBounds.minX - sizes.zoomPadding, scanY - 80, polyW, 84);

    ctx.beginPath();
    ctx.moveTo(polyBounds.minX - sizes.zoomPadding, scanY);
    ctx.lineTo(polyBounds.maxX + sizes.zoomPadding, scanY);
    ctx.strokeStyle = '#FFB179';
    ctx.lineWidth = 3 / zoom;
    ctx.shadowColor = '#FFB179';
    ctx.shadowBlur = 20;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(polyBounds.minX - sizes.zoomPadding, scanY);
    ctx.lineTo(polyBounds.maxX + sizes.zoomPadding, scanY);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1 / zoom;
    ctx.shadowColor = '#FFB179';
    ctx.shadowBlur = 30;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.restore();
  };
  const drawPulse = (ctx: CanvasRenderingContext2D, zoom: number, timestamp: number, pulseT: number) => {
    const pulse = Math.abs(Math.sin(timestamp * speeds.pulseFrequency * Math.PI * 2));
    ctx.save();
    applyZoom(ctx, zoom);
    ctx.beginPath();
    scaledPoly.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.strokeStyle = `rgba(255,82,27,${(0.4 + 0.6 * pulse) * pulseT})`;
    ctx.lineWidth = (sizes.polygonLineWidth + speeds.pulseAmplitude * pulse * pulseT) / zoom;
    ctx.shadowColor = colors.pulseGlow;
    ctx.shadowBlur = 18 * pulseT;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  };

  const drawFrame = (timestamp: number) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!startRef.current) startRef.current = timestamp;
    const elapsed = timestamp - startRef.current;

    const d0 = durations.pixelReveal;
    const d1 = d0 + durations.polygonDraw;
    const d2 = d1 + durations.zoomIn;

    let phase: number;
    let t: number;

    if (elapsed < d0) {
      phase = 0;
      t = elapsed / d0;
    } else if (elapsed < d1) {
      phase = 1;
      t = (elapsed - d0) / durations.polygonDraw;
    } else if (elapsed < d2) {
      phase = 2;
      t = (elapsed - d1) / durations.zoomIn;
    } else {
      phase = 3;
      t = (elapsed - d2) / durations.analysis;
    }
    const stepIndex = phase <= 1 ? 1 : phase === 2 ? 2 : 3;
    setActiveSteps(prev => {
      const next = [...new Set([...prev, stepIndex])];
      return next.length !== prev.length ? next : prev;
    });
    setCurrentStep(stepIndex);
    if (phase >= 2) setDoneSteps(prev => (prev.includes(1) ? prev : [...prev, 1]));
    if (phase >= 3) setDoneSteps(prev => (prev.includes(2) ? prev : [...prev, 2]));

    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, CW, CH);

    if (phase === 0) {
      const revealY = easeInOut(t) * CH;
      const cols = Math.ceil(CW / sizes.pixelSize);
      const rows = Math.ceil(CH / sizes.pixelSize);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const px = col * sizes.pixelSize;
          const py = row * sizes.pixelSize;
          if (py >= revealY) continue;
          if (px - offsetX < 0 || py - offsetY < 0 || px - offsetX >= IW || py - offsetY >= IH) continue;
          const rowT = Math.max(0, Math.min(1, (revealY - py) / (sizes.pixelSize * 6)));
          ctx.globalAlpha = easeInOut(rowT);
          const srcX = ((px - offsetX) / IW) * imageWidth;
          const srcY = ((py - offsetY) / IH) * imageHeight;
          const srcSize = sizes.pixelSize / scale;
          ctx.drawImage(img, srcX, srcY, srcSize, srcSize, px, py, sizes.pixelSize, sizes.pixelSize);
        }
      }
      ctx.globalAlpha = 1;
    }

    if (phase === 1) {
      drawBaseImage(ctx, img, 1);
      drawPolygonStroke(ctx, 1, easeInOut(t));
    }

    if (phase === 2) {
      const zoom = 1 + (targetZoom - 1) * easeOut(t);
      drawBaseImage(ctx, img, zoom);
      drawPolygonStroke(ctx, zoom, 1);
    }

    if (phase === 3) {
      const zoom = targetZoom;
      const scanDuration = 1800;
      const scanProgress = ((elapsed - d2) % scanDuration) / scanDuration;
      const scanY = polyBounds.minY + scanProgress * (polyBounds.maxY - polyBounds.minY);

      drawBaseImage(ctx, img, zoom);
      drawOverlayLayers(ctx, zoom, scanProgress);
      drawScanLine(ctx, zoom, scanY);
      drawPolygonStroke(ctx, zoom, 1);
    }

    animRef.current = requestAnimationFrame(drawFrame);

    if (phase === 4) {
      const zoom = targetZoom;
      drawBaseImage(ctx, img, zoom);
      drawOverlayLayers(ctx, zoom, 1);
      drawPolygonStroke(ctx, zoom, 1);
      drawPulse(ctx, zoom, timestamp, t);
    }
  };

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      startRef.current = 0;
      animRef.current = requestAnimationFrame(drawFrame);
    };
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <Box sx={RoofAnalysisDialogStyle}>
      <Box className='dialog-steps'>
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
                  className={['step-chip', isDone ? 'step-chip--done' : '', isCurrent ? 'step-chip--current' : ''].join(' ')}
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

      <Box className='dialog-canvas-wrapper' style={{ height: CH, width: CW }}>
        <canvas ref={canvasRef} width={CW} height={CH} className='dialog-canvas' />
      </Box>
    </Box>
  );
};
