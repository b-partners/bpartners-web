import { annotatorStore } from '@/common/store';
import { Dashboard, Roofing } from '@mui/icons-material';
import { Box, ButtonBase, Typography } from '@mui/material';
import { useShallow } from 'zustand/react/shallow';
import { ThreeDGenerationModeSwitchStyle } from './style';

export const ThreeDGenerationModeSwitch = () => {
  const { threeDFromSegmentation, setThreeDFromSegmentation } = annotatorStore.useAnnotatorStore(
    useShallow(({ threeDFromSegmentation, setThreeDFromSegmentation }) => ({ threeDFromSegmentation, setThreeDFromSegmentation }))
  );

  return (
    <Box sx={ThreeDGenerationModeSwitchStyle}>
      <Typography component='label' className='gen-mode-title'>
        Mode de délimitation
      </Typography>
      <Box className='gen-mode-tabs'>
        <ButtonBase type='button' onClick={() => setThreeDFromSegmentation(false)} className={`gen-mode-tab ${!threeDFromSegmentation ? 'active' : ''}`}>
          <Roofing />
          Toit
        </ButtonBase>
        <ButtonBase type='button' onClick={() => setThreeDFromSegmentation(true)} className={`gen-mode-tab ${threeDFromSegmentation ? 'active' : ''}`}>
          <Dashboard />
          Pans
        </ButtonBase>
      </Box>
    </Box>
  );
};
