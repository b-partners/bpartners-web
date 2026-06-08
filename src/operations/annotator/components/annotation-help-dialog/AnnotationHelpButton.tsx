import { cache, getCached } from '@/providers';
import { Close, HelpOutline } from '@mui/icons-material';
import { Box, Button, Checkbox, CircularProgress, Dialog, FormControlLabel, IconButton, Tooltip, Typography } from '@mui/material';
import { FC, useState } from 'react';
import { annotationHelpButtonStyle, annotationHelpDialogStyle } from './style';

const HELP_VIDEO_URL = 'https://www.youtube.com/embed/6nub7AjiwgQ';

export const AnnotationHelpButton = () => {
  const [open, setOpen] = useState(() => !getCached.annotatorTutorialSeen());
  const [errored, setErrored] = useState(false);
  const [doNotShowAgain, setDoNotShowAgain] = useState(() => getCached.annotatorTutorialSeen());

  const handleClose = () => {
    setOpen(false);
    setErrored(false);
  };

  const handleDoNotShowAgain = (checked: boolean) => {
    setDoNotShowAgain(checked);
    cache.annotatorTutorialSeen(checked);
  };

  return (
    <>
      <Tooltip title="Aide à l'annotation" arrow>
        <Button
          sx={annotationHelpButtonStyle}
          size='small'
          onClick={() => setOpen(true)}
          color='primary'
          variant='outlined'
          startIcon={<HelpOutline fontSize='small' />}
        >
          Tutoriel
        </Button>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth sx={annotationHelpDialogStyle}>
        <Box className='help-topbar'>
          <FormControlLabel
            className='help-do-not-show'
            control={
              <Checkbox className='help-do-not-show-checkbox' size='small' checked={doNotShowAgain} onChange={(_, checked) => handleDoNotShowAgain(checked)} />
            }
            label='Ne plus afficher automatiquement'
          />
          <IconButton className='help-close' onClick={handleClose}>
            <Close fontSize='small' />
          </IconButton>
        </Box>
        <Box className='help-stage'>
          {open && errored && <HelpLoader message='Échec de chargement du guide' />}
          {open && !errored && (
            <Box className='help-frame'>
              <iframe
                className='help-video'
                src={HELP_VIDEO_URL}
                title="Tutoriel d'annotation"
                frameBorder='0'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                referrerPolicy='strict-origin-when-cross-origin'
                allowFullScreen
                onError={() => setErrored(true)}
              />
            </Box>
          )}
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
