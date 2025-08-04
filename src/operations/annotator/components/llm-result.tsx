import { Properties } from '@/providers';
import { Box } from '@mui/material';
import { FC, useEffect, useRef } from 'react';
import { useLlmResultQuery } from '../utils';
import { llmResultStyle } from './style';

interface LlmResultProps {
  roofAnalyseProperties: Properties;
  width: string | number;
  height: string | number;
}

export const LlmResult: FC<LlmResultProps> = ({ height, roofAnalyseProperties, width }) => {
  const { data: htmlResult, isPending } = useLlmResultQuery(roofAnalyseProperties);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && htmlResult) {
      ref.current.innerHTML = htmlResult;
    }
  }, [htmlResult, ref]);

  return <Box component='div' ref={ref} sx={llmResultStyle} height={height || '100%'} width={width || '100%'}>
    {isPending && "loading ..."}
  </Box>;
};
