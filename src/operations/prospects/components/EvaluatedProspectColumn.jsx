import { Box, Button, Card, CardContent, Grid, Paper, Stack, Typography } from '@mui/material';
import { useProspectContext } from '@/common/store/prospect-store';
import { prospectFormMapper } from '@/providers/mappers/prospect-form-mapper';
import { prospectingJobsProvider } from '@/providers/prospecting-jobs-provider';
import { parseRatingLastEvaluation } from '../utils';

const EvaluatedProspectColumn = ({ title, data, color }) => {
  return (
    <Grid item xs={4}>
      <Card
        sx={{
          minWidth: 275,
          height: '89vh',
          boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.1) !important',
          border: 'none',
        }}
      >
        <CardContent>
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant='h6' color={color}>
                {title} ({data.length})
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
              {data && data.map(item => <EvaluatedProspectItem item={item} key={item.id} />)}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
};

const EvaluatedProspectItem = ({ item }) => {
  const { getProspectingJobs, toggleJobDetailsPopup } = useProspectContext();

  const restartProspectEvaluation = async metadata => {
    const interventionTypesArray = metadata?.interventionTypes?.split(',');
    const structureData = {
      ...metadata,
      interventionTypes: interventionTypesArray,
      metadata: metadata,
      min: parseInt(metadata.min),
      max: parseInt(metadata.max),
      minCustomerRating: parseFloat(metadata.minCustomerRating),
      minProspectRating: parseFloat(metadata.minProspectRating),
    };
    const newStructuredData = prospectFormMapper(structureData);
    await prospectingJobsProvider.saveOrUpdate(newStructuredData);
    getProspectingJobs();
  };

  return (
    <Paper elevation={2} sx={{ p: 1 }}>
      <Box data-cy={`view-details-job-${item?.id}`} sx={{ color: '#4d4d4d', cursor: 'pointer' }} onClick={() => toggleJobDetailsPopup(item)}>
        <Typography variant='body2' fontWeight={'bold'}>
          Types intervention :
        </Typography>
        <Typography variant='body2'>{item?.metadata?.interventionTypes?.replace(/,/g, ', ')}</Typography>
        <Typography variant='body2' fontWeight={'bold'}>
          Date :
        </Typography>
        <Typography variant='body2'>{parseRatingLastEvaluation(item?.startedAt)}</Typography>
        {item?.status?.value === 'FAILED' && (
          <>
            <Typography variant='body2' fontWeight={'bold'}>
              message erreur :
            </Typography>
            <Typography variant='body2' color={'#FA113D'}>
              {item?.status?.message}
            </Typography>
          </>
        )}
      </Box>
      {item?.status?.value === 'FAILED' && (
        <Button data-cy={`rerun-evaluation-failed-${item?.id}`} sx={{ mt: 2 }} type='submit' onClick={() => restartProspectEvaluation(item?.metadata)}>
          Relancer
        </Button>
      )}
    </Paper>
  );
};

export default EvaluatedProspectColumn;
