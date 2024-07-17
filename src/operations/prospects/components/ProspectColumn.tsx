import { EmptyList } from '@/common/components/EmptyList';
import { Prospect } from '@bpartners/typescript-client';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, Card, CardActions, CardContent, Grid, IconButton, Stack, Typography } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { ProspectItem } from './ProspectItem';
interface ProspectColumnProps {
  color: string;
  list: Prospect[];
  title: string;
}

export const ProspectColumn: FC<ProspectColumnProps> = props => {
  const { title, list = [], color } = props;

  const [prospects, setProspects] = useState([]);
  const [page, setPage] = useState(0);
  const perPage = 20;

  useEffect(() => {
    setProspects(list.slice(page * perPage, page * perPage + perPage));
    if (list.length < perPage * page) {
      setPage(0);
    }
  }, [list]);

  useEffect(() => {
    setProspects(list.slice(page * perPage, page * perPage + perPage));
  }, [page]);

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
              {prospects.map(item => (
                <ProspectItem key={`prospect-item-${item.id}`} prospect={item} />
              ))}
              {prospects.length === 0 && <EmptyList />}
            </Stack>
          </Stack>
        </CardContent>
        <CardActions sx={{ width: 'auto' }}>
          <Stack direction='row' alignItems='center' justifyContent='space-between'>
            <IconButton
              data-cy={`${title}-prev-button`}
              disabled={page === 0}
              style={{ marginRight: 6 }}
              color='primary'
              onClick={() => setPage(prev => prev - 1)}
            >
              <ChevronLeft />
            </IconButton>
            <Box paddingX={2}>
              <Typography>{page + 1}</Typography>
            </Box>
            <IconButton
              data-cy={`${title}-next-button`}
              disabled={(page + 1) * perPage >= list.length}
              style={{ marginLeft: 6 }}
              color='primary'
              onClick={() => setPage(prev => prev + 1)}
            >
              <ChevronRight />
            </IconButton>
          </Stack>
        </CardActions>
      </Card>
    </Grid>
  );
};
