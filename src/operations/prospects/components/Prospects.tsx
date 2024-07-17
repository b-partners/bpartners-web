import { Prospect } from '@bpartners/typescript-client';
import { Box, Grid } from '@mui/material';
import { groupBy } from 'lodash';
import { useListContext } from 'react-admin';
import { ProspectColumn } from './ProspectColumn';

export const Prospects = () => {
  const { data = [], isLoading } = useListContext();
  const prospects = groupBy(sortProspectsByDate(data), 'status');

  if (isLoading) {
    return null;
  }

  function sortProspectsByDate(data: Prospect[]) {
    // Sort the prospects by "lastEvaluation" date from most recent to least recent
    return data.sort((a, b) => {
      const dateA = new Date(a?.rating?.lastEvaluation).getTime();
      const dateB = new Date(b?.rating?.lastEvaluation).getTime();
      return dateB - dateA;
    });
  }

  return (
    <Box>
      <Grid container justifyContent='space-between' spacing={2}>
        <ProspectColumn title='À contacter' list={prospects['TO_CONTACT']} color='#005ce6' />
        <ProspectColumn title='Contactés' list={prospects['CONTACTED']} color='#cc0099' />
        <ProspectColumn title='Convertis' list={prospects['CONVERTED']} color='#00cc33' />
      </Grid>
    </Box>
  );
};
