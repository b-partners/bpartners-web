import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Box, IconButton, SxProps, Typography } from '@mui/material';
import { useTheme } from '@mui/styles';
import { Dispatch, FC, SetStateAction } from 'react';
import { BP_COLOR } from '../../bp-theme';

const STYLE: SxProps = {
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

export type VerticalPaginationProps = {
  maxSteps: number;
  activeStep: number;
  setActiveStep: Dispatch<SetStateAction<number>>;
  boxSx?: SxProps;
};

export const VerticalPagination: FC<VerticalPaginationProps> = ({ maxSteps, activeStep, setActiveStep, boxSx }) => {
  const theme = useTheme<{ direction: string }>();

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
