import { EmptyList } from '@/common/components/EmptyList';
import { useProspectFetcher } from '@/common/fetcher';
import { ProspectStatus } from '@bpartners/typescript-client';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, Card, CardActions, CardContent, CircularProgress, Grid, IconButton, Stack, Typography } from '@mui/material';
import { FC } from 'react';
import { ProspectItem } from './ProspectItem';
interface ProspectColumnProps {
  color: string;
  status: ProspectStatus;
  title: string;
}

export const ProspectColumn: FC<ProspectColumnProps> = props => {
  const { title, status, color } = props;
  const { nextPage, prevPage, prospects, hasNextPage, page, isLoading } = useProspectFetcher(status);

  return (
    <Grid item xs={4}>
      <Card
        sx={{
          minWidth: 275,
          minHeight: '89vh',
          boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.1) !important',
          border: 'none',
        }}
      >
        <CardContent>
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant='h6' color={color}>
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
                  <CircularProgress />
                </Stack>
              )}
              {!isLoading && prospects.map(item => <ProspectItem key={`prospect-item-${item.id}`} prospect={item} />)}
              {!isLoading && prospects.length === 0 && <EmptyList />}
            </Stack>
          </Stack>
        </CardContent>
        <CardActions sx={{ width: 'auto' }}>
          <Stack direction='row' alignItems='center' justifyContent='space-between'>
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
        </CardActions>
      </Card>
    </Grid>
  );
};
