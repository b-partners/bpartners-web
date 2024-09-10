import { Box, Grid } from '@mui/material';
import { ProspectColumn } from './ProspectColumn';

export const Prospects = () => {

  return (
    <Box>
      <Grid container justifyContent='space-between' spacing={2}>
        <ProspectColumn title='À contacter' status='TO_CONTACT' color='#005ce6' />
        <ProspectColumn title='Contactés' status='CONTACTED' color='#cc0099' />
        <ProspectColumn title='Convertis' status='CONVERTED' color='#00cc33' />
      </Grid>
    </Box>
  );
};
