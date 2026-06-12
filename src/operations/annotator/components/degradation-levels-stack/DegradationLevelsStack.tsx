import { degradationLevels } from '@/operations/prospects/constants';
import { Box, Stack, Typography } from '@mui/material';
import { FC } from 'react';
import { DegradationLevelsStackStyle } from './style';

interface DegradationLevelsStackProps {
  globalRate: { value: number; type: string };
}

export const DegradationLevelsStack: FC<DegradationLevelsStackProps> = ({ globalRate, ...rest }) => {
  const activeLevel = degradationLevels.find(({ label }) => label === globalRate.type) ?? degradationLevels[0];

  return (
    <Box className='degradation-fieldset' sx={DegradationLevelsStackStyle} {...rest}>
      <Typography component='legend' className='degradation-legend'>
        Note de dégradation globale
      </Typography>
      <Box className='degradation-stack'>
        <Stack className='degradation-popup' gap={0.5}>
          {degradationLevels.map(({ color, label, textColor, name }) => (
            <Stack
              key={label}
              className={`degradation-popup-item${label === activeLevel.label ? ' degradation-popup-item-active' : ''}`}
              direction='row'
              alignItems='center'
              gap={1}
              sx={{ bgcolor: color, color: textColor }}
            >
              <Box className='degradation-popup-letter'>{label}</Box>
              <Typography className='degradation-popup-name'>{name}</Typography>
            </Stack>
          ))}
        </Stack>
        <Box className='degradation-pill-active' sx={{ bgcolor: activeLevel.color, color: activeLevel.textColor }}>
          <Box className='degradation-pill-letter'>{activeLevel.label}</Box>
          <Typography className='degradation-pill-value'>{globalRate.value}%</Typography>
        </Box>
      </Box>
    </Box>
  );
};
