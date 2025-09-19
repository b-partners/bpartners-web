import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { FC, useEffect, useRef } from 'react';
import { llmResultStyle } from './style';

interface LlmResultProps {
  width: string | number;
  height: string | number;
  htmlResult: string;
  isLoading: boolean;
}

export const LlmResult: FC<LlmResultProps> = ({ height, width, htmlResult, isLoading }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && htmlResult) {
      ref.current.innerHTML = htmlResult;
    }
  }, [htmlResult, ref]);

  return (
    <Box component='div' ref={ref} sx={llmResultStyle} height={height || '100%'} width={width || '100%'}>
      {isLoading && (
        <Box className='loading-container'>
          <Stack className='loading-element-container'>
            <CircularProgress />
            <Typography>Chargement des explications du rapport...</Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
};
