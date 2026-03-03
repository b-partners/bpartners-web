import { Box } from '@mui/material';
import { FC, useEffect, useRef } from 'react';
import { useLlmResultQuery } from '../utils';
import { LlmReportLoading } from './loading';
import { llmResultStyle } from './style';

interface LlmResultProps {
  width: string | number;
  height: string | number;
}

export const LlmResult: FC<LlmResultProps> = ({ height, width }) => {
  const { data: htmlResult, isPending: isLoading } = useLlmResultQuery();

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && htmlResult) ref.current.innerHTML = htmlResult;
  }, [htmlResult, ref, isLoading]);

  return (
    <>
      {!isLoading && <Box component='div' ref={ref} sx={llmResultStyle} height={height || '100%'} width={width || '100%'}></Box>}
      {isLoading && <LlmReportLoading height={height || '100%'} width={width || '100%'} />}
    </>
  );
};
