import { BPButton, BpFormField } from '@/common/components';
import { BpAutoComplete } from '@/common/components/BpAutoComplete';
import { useAccountForm } from '@/common/form';
import { Edit } from '@mui/icons-material';
import { Box, Card, CardContent, Grid, IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import { useRecordContext } from 'react-admin';
import { FormProvider } from 'react-hook-form';
import { useGetBusinessJob, useUpdateBusinessJob, useUpdateGlobalInformationFieldsCompany } from '../queries';
import { useAccountHolderProviderFieldsCompany } from '../queries/company-information-query';
import { useRevenueTargetsProvider } from '../queries/revenue-target-form-query';
import { businessActivitiesField, getCompanyFields } from './CompanyFields';

export const CompanyCard = () => {
  const record = useRecordContext();
  const fields = getCompanyFields(record);
  const accountForm = useAccountForm(record as any);
  const { jobList } = useGetBusinessJob();
  const { isUpldateBusinessJobLoading, updateBusinessJob } = useUpdateBusinessJob();
  const { isUpldateGlobalInformation, updateGlobalInformation } = useUpdateGlobalInformationFieldsCompany();
  const { isaccountHolderProvider, accountHolderProvider } = useAccountHolderProviderFieldsCompany();
  const [editMode, setEditMode] = useState(false);
  const { isRevenueTargetsProvider, updateRevenueTargets } = useRevenueTargetsProvider();
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleSubmit = accountForm.handleSubmit(formData => {
    updateBusinessJob(formData.businessActivities);
    updateGlobalInformation({
      name: formData.name,
      siren: formData.siren,
      initialCashFlow: formData.initialCashFlow,
      officialActivityName: formData.officialActivityName,
      contactAddress: formData.contactAddress,
    });
    accountHolderProvider([formData.companyInfo]);
    updateRevenueTargets(formData.revenueTargets);
  });
  console.log(record);

  return (
    <FormProvider {...accountForm}>
      <Card className='card company-card'>
        <CardContent>
          <Box className='company-header'>
            <Typography className='section-title-company'>Ma société</Typography>
            <IconButton className={`buton-edit ${editMode ? 'active' : ''}`} onClick={toggleEditMode}>
              <Edit />
            </IconButton>
          </Box>
          <Grid container spacing={2}>
            {editMode &&
              fields
                .filter(({ name }) => !!name)
                .map(({ name, label }) => (
                  <Grid item xs={12} sm={4} key={name + label}>
                    <BpFormField style={{ width: '100%' }} name={name} label={label} variant='outlined' />
                  </Grid>
                ))}
            {!editMode &&
              fields
                .filter(({ name, showOnEdit }) => !!name && !showOnEdit)
                .map(({ name, label }) => (
                  <Grid item xs={12} sm={4} key={name + label}>
                    <Typography sx={{fontWeight: 'bold', fontSize: '1,3rem'}}>{label} </Typography>
                    <Typography>{accountForm.getValues(name || ('' as any)) || 'Non renseigné'} </Typography>
                  </Grid>
                ))}
            {businessActivitiesField.map(values => (
              <Grid item xs={12} sm={4} key={JSON.stringify(values)}>
                {editMode ? (
                  <BpAutoComplete fullWidth {...values} options={jobList} />
                ) : (
                  <>
                    <Typography sx={{fontWeight: 'bold', fontSize: '1,3rem'}}>{values.label} </Typography>
                    <Typography>{accountForm.getValues(values.name || ('' as any))} </Typography>
                  </>
                )}
              </Grid>
            ))}
          </Grid>
          {editMode && (
            <Box className='company-header'>
              <BPButton
                label='Enregistrer'
                onClick={handleSubmit}
                isLoading={isUpldateBusinessJobLoading || isUpldateGlobalInformation || isaccountHolderProvider || isRevenueTargetsProvider}
                className='save-information-button'
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </FormProvider>
  );
};
