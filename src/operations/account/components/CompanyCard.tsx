import { BPButton, BpFormField } from '@/common/components';
import { BpAutoComplete } from '@/common/components/BpAutoComplete';
import { useAccountForm } from '@/common/form';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { useRecordContext } from 'react-admin';
import { FormProvider } from 'react-hook-form';
import { useGetBusinessJob, useUpdateBusinessJob } from '../queries';
import { businessActivitiesField, getCompanyFields } from './CompanyFields';

export const CompanyCard = () => {
  const record = useRecordContext();
  const fields = getCompanyFields(record);
  const accountForm = useAccountForm(record as any);
  const { jobList } = useGetBusinessJob();
  const { isUpldateBusinessJobLoading, updateBusinessJob } = useUpdateBusinessJob();

  const handleSubmit = accountForm.handleSubmit(formData => updateBusinessJob(formData.businessActivities));

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
                  <BpFormField style={{ width: '100%' }} name={name} label={label} variant='outlined' />
                </Grid>
              ))}
            {businessActivitiesField.map(values => (
              <Grid item xs={12} sm={4} key={JSON.stringify(values)}>
                <BpAutoComplete fullWidth {...values} options={jobList} />
              </Grid>
            ))}
            <Grid item xs={12} sm={4}>
              <BPButton label='Enregister' onClick={handleSubmit} isLoading={isUpldateBusinessJobLoading} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </FormProvider>
  );
};
