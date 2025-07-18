import { Box, Grid } from '@mui/material';
import { CompanyCard } from '../components/CompanyCard';
import { AccountStyle } from '../components/style';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { TrialCard } from '../components/TrialCard';
import { UserCard } from '../components/UserCard';

export const Account = () => {
  return (
    <Box component='section' id='section-account' sx={AccountStyle}>
      <Box id='container'>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <UserCard />
          </Grid>
          <Grid item xs={12} md={6}>
            <TrialCard />
          </Grid>
          <Grid item xs={12}>
            <CompanyCard />
          </Grid>
          <Grid item xs={12}>
            <SubscriptionCard />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
