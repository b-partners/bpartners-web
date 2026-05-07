import { useDialog } from '@/common/store/dialog';
import { useCityJsonPanCaptureStore } from '@/lib/cityjson';
import { Box, Button, CircularProgress, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import { panCapturesDialogStyle as style } from './style';

export const PanCapturesDialog = () => {
  const { close } = useDialog();
  const captures = useCityJsonPanCaptureStore(state => state.captures);
  const isCapturing = useCityJsonPanCaptureStore(state => state.isCapturing);

  return (
    <>
      <DialogTitle>Captures des pans</DialogTitle>
      <DialogContent sx={style.content}>
        {isCapturing && (
          <Box sx={style.loader}>
            <CircularProgress size={28} />
            <Typography>Capture en cours…</Typography>
          </Box>
        )}
        {!isCapturing && captures.length === 0 && (
          <Box sx={style.empty}>
            <Typography>Aucune capture disponible.</Typography>
          </Box>
        )}
        {!isCapturing && captures.length > 0 && (
          <Grid container spacing={2}>
            {captures.map(capture => (
              <Grid item xs={12} sm={6} md={4} key={capture.index}>
                <Box sx={style.card}>
                  <img className='pan-image' src={capture.dataUrl} alt={`Pan ${capture.index}`} />
                  <Typography className='pan-label'>Pan {capture.index}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Fermer</Button>
      </DialogActions>
    </>
  );
};
