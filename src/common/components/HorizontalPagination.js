import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import { useTheme } from '@mui/styles';

const STYLE = {
  width: 'max-content',
  minHeight: 'max-content',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderRadius: '13px',
  backgroundColor: '#fff',
  padding: '0.1rem',
};

export const HorizontalPagination = ({ maxSteps, activeStep, setActiveStep, boxSx }) => {
  const theme = useTheme();

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  return (
    <Box sx={{ ...STYLE, ...boxSx }}>
      <IconButton size='small' onClick={handleBack} data-test-item='pdf-prev' disabled={activeStep === 1 || maxSteps === 0}>
        {theme?.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>

      <Typography>
        {activeStep} / {maxSteps}
      </Typography>

      <IconButton size='small' onClick={handleNext} data-test-item='pdf-next' disabled={activeStep === maxSteps || maxSteps === 0}>
        {theme?.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
    </Box>
  );
};
