import { useIsSecondaryUser } from '@/common/hooks';
import { CompanyCard } from '@/operations/account/components/CompanyCard';
import { SecondaryUserCard } from '@/operations/account/components/SecondaryUserCard';
import { AccountStyle } from '@/operations/account/components/style';
import { SubscriptionCard } from '@/operations/account/components/SubscriptionCard';
import { TrialCard } from '@/operations/account/components/TrialCard';
import { UserCard } from '@/operations/account/components/UserCard';
import { Grid } from '@mui/material';
import { ShowBase, SimpleShowLayout } from 'react-admin';

export const AccountShow = () => {
  const isSecondaryUser = useIsSecondaryUser();

  return (
    <ShowBase id='' resource='accountHolder'>
      <SimpleShowLayout>
        <Grid sx={AccountStyle} container spacing={2}>
          <Grid item xs={12} md={6}>
            <UserCard />
          </Grid>
          <Grid item xs={12} md={6}>
            {isSecondaryUser ? <SecondaryUserCard /> : <TrialCard />}
          </Grid>
          <Grid item xs={12}>
            <CompanyCard />
          </Grid>
          {!isSecondaryUser && (
            <Grid item xs={12}>
              <SubscriptionCard />
            </Grid>
          )}
        </Grid>
      </SimpleShowLayout>
    </ShowBase>
  );
};
