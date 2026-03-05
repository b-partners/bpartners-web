import { Box, Skeleton, Stack } from '@mui/material';
import { FC } from 'react';
import { llmResultStyle } from '../style';

interface LlmReportLoadingProps {
  width: string | number;
  height: string | number;
}

export const LlmReportLoading: FC<LlmReportLoadingProps> = ({ height, width }) => {
  return (
    <Box component='div' sx={llmResultStyle} height={height || '100%'} width={width || '100%'}>
      <Stack alignItems='center'>
        {/* title 1 */}
        <Skeleton height={60} width='50%' />
        {/* title 1.2 */}
        <Stack direction='row' gap={1} width='40%' my={1} justifyContent='center' alignItems='center' display='flex'>
          <Skeleton variant='circular' height={30} width={30} />
          <Skeleton height={50} width='90%' />
        </Stack>
        {/* block 1 */}
        <Skeleton height={30} width='90%' />
        <Skeleton height={30} width='90%' />
        <Stack width='90%'>
          <Skeleton height={30} width='70%' />
        </Stack>
        {/* block 2  */}
        <Skeleton sx={{ mt: 2 }} height={30} width='90%' />
        <Stack width='90%'>
          <Skeleton height={30} width='20%' />
        </Stack>
        {/* block 3 */}
        <Skeleton height={30} sx={{ mt: 2 }} width='90%' />
        <Skeleton height={30} width='90%' />
        <Stack width='90%'>
          <Skeleton height={30} width='80%' />
        </Stack>
        {/* title 2 */}
        <Skeleton height={60} width='50%' sx={{ my: 3 }} />
        {/* block 1 */}
        <Stack direction='row' gap={1} width='90%' justifyContent='flex-start' alignItems='center' display='flex'>
          <Skeleton variant='circular' height={20} width={20} />
          <Skeleton height={30} width='90%' />
        </Stack>
        <Skeleton height={30} width='90%' />
        <Stack width='90%'>
          <Skeleton height={30} width='60%' />
        </Stack>
        {/* block 2 */}
        <Stack direction='row' gap={1} width='90%' mt={2} justifyContent='flex-start' alignItems='center' display='flex'>
          <Skeleton variant='circular' height={20} width={20} />
          <Skeleton height={30} width='90%' />
        </Stack>
        <Skeleton height={30} width='90%' />
        <Stack width='90%'>
          <Skeleton height={30} width='60%' />
        </Stack>
      </Stack>
    </Box>
  );
};
