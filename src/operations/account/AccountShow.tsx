import { CompanyCard } from '@/operations/account/components/CompanyCard';
import { AccountStyle } from '@/operations/account/components/style';
import { SubscriptionCard } from '@/operations/account/components/SubscriptionCard';
import { TrialCard } from '@/operations/account/components/TrialCard';
import { UserCard } from '@/operations/account/components/UserCard';
import { Grid } from '@mui/material';
import { ShowBase, SimpleShowLayout } from 'react-admin';

export const AccountShow = () => {
  return (
    <ShowBase id='' resource='accountHolder'>
      <SimpleShowLayout>
        <Grid sx={AccountStyle} container spacing={2}>
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
      </SimpleShowLayout>
    </ShowBase>
  );
};
