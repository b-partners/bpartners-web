import { BP_COLOR } from '@/bp-theme';
import { EmptyList } from '@/common/components/EmptyList';
import { useProspectFetcher } from '@/common/fetcher';
import { ProspectStatus } from '@bpartners/typescript-client';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, CircularProgress, Grid, IconButton, Stack, Typography } from '@mui/material';
import { FC } from 'react';
import { ProspectItem } from './ProspectItem';
import { PALETTE_COLORS } from '@/common/config/theme';

interface ProspectColumnProps {
  status: ProspectStatus;
  title: string;
}

const getColor = (prospectStatus: ProspectStatus) => {
  switch (prospectStatus) {
    case ProspectStatus.TO_CONTACT:
      return { from: '', to: '0 2px 6px #CECECE' ,text: PALETTE_COLORS.black };
    case ProspectStatus.CONTACTED:
      return { from: PALETTE_COLORS.neon_orange, to: '0 2px 10px #CECECE', text: PALETTE_COLORS.white };
    case ProspectStatus.CONVERTED:
      return { from: PALETTE_COLORS.pine, to: '0 2px 10px #CECECE', text: PALETTE_COLORS.white };
    default:
      return { from: '#F8F9FA', to: '#D6D8DB', text: '#6C757D' };
  }
};

export const ProspectColumn: FC<ProspectColumnProps> = ({ title, status }) => {
  const { nextPage, prevPage, prospects, hasNextPage, page, isLoading } = useProspectFetcher(status);
  const color = getColor(status);
  return (
    <Grid item xs={4}>
      <Stack spacing={3}>
        <Box
          sx={{
            p: 2,
            background: `${color.from}`,
            boxShadow: `${color.to}`,
            borderRadius: '8px',
          }}
        >
          <Typography color={color.text} variant='h6'>
            {title}
          </Typography>
        </Box>

        <Stack
          spacing={1}
          sx={{
            overflowY: 'scroll',
            height: '75vh',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {isLoading && (
            <Stack width='100%' alignItems='center' height='20rem' justifyContent='center'>
              <CircularProgress sx={{ color: BP_COLOR['5'] }} />
            </Stack>
          )}
          {!isLoading && prospects.map(item => <ProspectItem key={`prospect-item-${item.id}`} prospect={item} />)}
          {!isLoading && prospects.length === 0 && <EmptyList />}
        </Stack>
      </Stack>
      <Stack sx={{ bgcolor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', py: 1, px: 2, borderRadius: '8px', mt: 1 }}>
        <IconButton data-cy={`${title}-prev-button`} disabled={page === 1 || isLoading} style={{ marginRight: 6 }} color='primary' onClick={prevPage}>
          <ChevronLeft />
        </IconButton>
        <Box paddingX={2}>
          <Typography>{page}</Typography>
        </Box>
        <IconButton data-cy={`${title}-next-button`} disabled={!hasNextPage || isLoading} style={{ marginLeft: 6 }} color='primary' onClick={nextPage}>
          <ChevronRight />
        </IconButton>
      </Stack>
    </Grid>
  );
};
