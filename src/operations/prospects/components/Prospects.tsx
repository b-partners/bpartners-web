import { Box, Grid } from '@mui/material';
import { ProspectColumn } from './ProspectColumn';

export const Prospects = () => {
  return (
    <Box>
      <Grid container justifyContent='space-between' spacing={2}>
        <ProspectColumn title='À contacter' status='TO_CONTACT'/>
        <ProspectColumn title='Contactés' status='CONTACTED' />
        <ProspectColumn title='Convertis' status='CONVERTED' />
      </Grid>
    </Box>
  );
};
