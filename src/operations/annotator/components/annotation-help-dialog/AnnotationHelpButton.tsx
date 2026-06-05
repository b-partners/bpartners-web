import { Close, HelpOutline, Pause, PlayArrow, SkipNext, SkipPrevious } from '@mui/icons-material';
import { Box, CircularProgress, Dialog, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { FC, MouseEvent, useEffect, useRef, useState } from 'react';
import { Document as Pdf, Page as PdfPage } from 'react-pdf/dist/esm/entry.vite';
import { annotationHelpButtonStyle, annotationHelpDialogStyle } from './style';

const HELP_PDF_URL = '/annotation-help.pdf';
const PAGE_MS = 5000;
const TICK_MS = 60;
const STEP = TICK_MS / PAGE_MS;

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export const AnnotationHelpButton = () => {
  const [open, setOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [pageWidth, setPageWidth] = useState(820);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setPage(1);
    setTick(0);
    setPlaying(true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const measure = () => {
      if (stageRef.current) setPageWidth(Math.max(320, stageRef.current.clientWidth - 48));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [open, total]);

  useEffect(() => {
    if (!open || !playing || !total) return;
    const id = setInterval(() => {
      setTick(value => {
        const next = value + STEP;
        if (next >= 1) {
          setPage(current => (current >= total ? 1 : current + 1));
          return 0;
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [open, playing, total]);

  const progressRatio = total ? (page - 1 + tick) / total : 0;
  const elapsedMs = (page - 1 + tick) * PAGE_MS;

  const goPrev = () => {
    setTick(0);
    setPage(current => (current <= 1 ? total || 1 : current - 1));
  };

  const goNext = () => {
    setTick(0);
    setPage(current => (current >= total ? 1 : current + 1));
  };

  const seek = (event: MouseEvent<HTMLDivElement>) => {
    if (!total) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    setTick(0);
    setPage(Math.min(total, Math.max(1, Math.floor(ratio * total) + 1)));
  };

  return (
    <>
      <Tooltip title="Aide à l'annotation" arrow>
        <IconButton sx={annotationHelpButtonStyle} size='small' onClick={() => setOpen(true)}>
          <HelpOutline fontSize='small' />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='md' fullWidth sx={annotationHelpDialogStyle}>
        <Box className='help-topbar'>
          <Stack className='help-brand' direction='row' alignItems='center' gap={1}>
            <Box className='help-brand-mark'>B</Box>
            <Box>
              <Typography className='help-brand-text'>BIRDIA · Aide</Typography>
              <Typography className='help-brand-sub'>Guide d'annotation · Tutoriel</Typography>
            </Box>
          </Stack>
          <IconButton className='help-close' onClick={() => setOpen(false)}>
            <Close fontSize='small' />
          </IconButton>
        </Box>
        <Box className='help-stage' ref={stageRef}>
          <Pdf
            file={HELP_PDF_URL}
            onLoadSuccess={({ numPages }: { numPages: number }) => setTotal(numPages)}
            loading={<HelpLoader />}
            error={<HelpLoader message='Échec de chargement du guide' />}
            noData={<HelpLoader message='Aucun guide disponible' />}
          >
            <Box className='help-frame' key={page}>
              <PdfPage pageNumber={page} width={pageWidth} renderTextLayer={false} renderAnnotationLayer={false} loading={<HelpLoader />} />
            </Box>
          </Pdf>
        </Box>
        <Box className='help-controls'>
          <IconButton className='help-btn' onClick={() => setPlaying(value => !value)}>
            {playing ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton className='help-btn' onClick={goPrev}>
            <SkipPrevious />
          </IconButton>
          <IconButton className='help-btn' onClick={goNext}>
            <SkipNext />
          </IconButton>
          <Box className='help-progress-wrap'>
            <Box className='help-progress' onClick={seek}>
              <Box className='help-progress-fill' style={{ width: `${progressRatio * 100}%` }} />
            </Box>
            <Box className='help-meta'>
              <Typography component='strong' className='help-counter'>
                {page} / {total || '–'}
              </Typography>
              <Typography component='span' className='help-timing'>
                {formatTime(elapsedMs)} / {formatTime(total * PAGE_MS)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

interface HelpLoaderProps {
  message?: string;
}

const HelpLoader: FC<HelpLoaderProps> = ({ message }) => (
  <Box className='help-loader'>{message ? <Typography variant='body2'>{message}</Typography> : <CircularProgress color='inherit' size={28} />}</Box>
);
