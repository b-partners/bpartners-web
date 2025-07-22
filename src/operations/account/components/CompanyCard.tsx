import { BpFormField } from '@/common/components';
import { useAccountForm } from '@/common/form';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { useRecordContext } from 'react-admin';
import { FormProvider } from 'react-hook-form';
import { getCompanyFields } from './CompanyFields';

export const CompanyCard = () => {
  const record = useRecordContext();
  const fields = getCompanyFields(record);
  const accountForm = useAccountForm(record as any);
  console.log('FIELDS:', fields);

  return (
    <FormProvider {...accountForm}>
      <Card className='card company-card'>
        <CardContent>
          <Typography className='section-title-company'>Ma société</Typography>
          <Grid container spacing={2}>
            {fields
              .filter(({ name }) => !!name)
              .map(({ name, label }) => (
                <Grid item xs={12} sm={4} key={name + label}>
                  <BpFormField style={{width: '100%'}} name={name} label={label} variant='outlined' />
                </Grid>
              ))}
          </Grid>
        </CardContent>
      </Card>
    </FormProvider>
  );
};
