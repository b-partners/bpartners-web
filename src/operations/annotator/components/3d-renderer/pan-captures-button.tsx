import { useDialog } from '@/common/store/dialog';
import { useCityJsonPanCaptureStore } from '@/lib/cityjson';
import { PhotoCamera } from '@mui/icons-material';
import { Button } from '@mui/material';
import { PanCapturesDialog } from './pan-captures-dialog';
import { panCapturesButtonStyle as style } from './style';

export const PanCapturesButton = () => {
  const { open } = useDialog();
  const triggerCapture = useCityJsonPanCaptureStore(state => state.triggerCapture);
  const isCapturing = useCityJsonPanCaptureStore(state => state.isCapturing);

  const handleClick = () => {
    triggerCapture();
    open(<PanCapturesDialog />, { maxWidth: 'lg', fullWidth: true });
  };

  return (
    <Button onClick={handleClick} disabled={isCapturing} variant='contained' size='small' startIcon={<PhotoCamera />} sx={style.button}>
      Capturer les pans
    </Button>
  );
};
