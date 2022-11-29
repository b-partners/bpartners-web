import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import { Box, IconButton, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BP_COLOR } from '../../bpTheme';

const STYLE = {
  width: 'max-content',
  minHeight: 'max-content',
  height: 150,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  borderRadius: '13px',
  backgroundColor: '#fff',
  border: `1px solid ${BP_COLOR['solid_grey']}`,
  padding: '0.1rem',
};

export const VerticalPagination = ({ maxSteps, activeStep, setActiveStep, boxSx }) => {
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
        {theme.direction === 'rtl' ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
      </IconButton>

      <Typography>
        {activeStep} / {maxSteps}
      </Typography>

      <IconButton size='small' onClick={handleNext} data-test-item='pdf-next' disabled={activeStep === maxSteps || maxSteps === 0}>
        {theme.direction === 'rtl' ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      </IconButton>
    </Box>
  );
};
