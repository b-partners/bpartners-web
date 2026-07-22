import { BPButton, BpFormField } from '@/common/components';
import { BpAutoComplete } from '@/common/components/BpAutoComplete';
import { useAccountForm } from '@/common/form';
import { prettyPrintMoney, stringCutter, toMajors } from '@/common/utils';
import { AccountHolder } from '@bpartners/typescript-client';
import { Edit } from '@mui/icons-material';
import { Box, Card, CardContent, Grid, IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import { useNotify, useRecordContext, useRefresh } from 'react-admin';
import { FieldErrors, FormProvider } from 'react-hook-form';
import { useGetBusinessJob, useUpdateBusinessJob, useUpdateGlobalInformationFieldsCompany } from '../queries';
import { useAccountHolderProviderFieldsCompany } from '../queries/company-information-query';
import { useUpdateFeedbackLink } from '../queries/feedback-query';
import { businessActivitiesField, getCompanyFields, getInvalidFieldLabels } from './CompanyFields';

const mapAccountHolder = (accountHolder: AccountHolder) => {
  return {
    ...accountHolder,
    companyInfo: { ...accountHolder.companyInfo, socialCapital: toMajors(Number(accountHolder.companyInfo.socialCapital)) },
  } as AccountHolder;
};

export const CompanyCard = () => {
  const record = useRecordContext();
  const refresh = useRefresh();
  const notify = useNotify();
  const fields = getCompanyFields(record);
  const notifyInvalidFields = (errors: FieldErrors) => notify(`Impossible d'enregistrer : ${getInvalidFieldLabels(errors).join(', ')}`, { type: 'warning' });
  const accountForm = useAccountForm(mapAccountHolder(record as any) as any);
  const { jobList } = useGetBusinessJob();
  const { isUpldateBusinessJobLoading, updateBusinessJob } = useUpdateBusinessJob();
  const { isUpldateGlobalInformation, updateGlobalInformation } = useUpdateGlobalInformationFieldsCompany();
  const { isaccountHolderProvider, accountHolderProvider } = useAccountHolderProviderFieldsCompany();
  const [editMode, setEditMode] = useState(false);
  const { isUpdateFeedbackLink, updateFeedbackLink } = useUpdateFeedbackLink();
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleSubmit = accountForm.handleSubmit(async formData => {
    await updateBusinessJob(formData.businessActivities);
    await accountHolderProvider([formData.companyInfo]);
    await updateFeedbackLink(formData.feedback?.feedbackLink);
    await updateGlobalInformation({
      name: formData.name,
      siren: formData.siren,
      officialActivityName: formData.officialActivityName,
      contactAddress: formData.contactAddress,
    });
    refresh();
  }, notifyInvalidFields);

  return (
    <FormProvider {...accountForm}>
      <Card className='card company-card'>
        <CardContent data-cy='profile-field-container'>
          <Box className='company-header'>
            <Typography className='section-title-company'>Ma société</Typography>
            <IconButton data-cy='edit-mode-button' className={`buton-edit ${editMode ? 'active' : ''}`} onClick={toggleEditMode}>
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
                .map(({ name, label, isMoney, cutString }) => (
                  <Grid item xs={12} sm={4} key={name + label}>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '1,3rem' }}>{label} </Typography>
                    <Typography>
                      {!accountForm.getValues(name as any) && !isMoney && 'Non renseigné'}
                      {isMoney && prettyPrintMoney(accountForm.getValues(name as any) || '0', false)}
                      {!isMoney && !cutString && accountForm.getValues(name as any)}
                      {!isMoney && cutString && stringCutter(accountForm.getValues(name as any), 50)}
                    </Typography>
                  </Grid>
                ))}
            {businessActivitiesField.map(values => (
              <Grid item xs={12} sm={4} key={JSON.stringify(values)}>
                {editMode ? (
                  <BpAutoComplete fullWidth data-cy={values['data-cy']} {...values} options={jobList} />
                ) : (
                  <>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '1,3rem' }}>{values.label} </Typography>
                    <Typography>{accountForm.getValues(values.name as any) || 'Non renseigné'} </Typography>
                  </>
                )}
              </Grid>
            ))}
          </Grid>
          {editMode && (
            <Box className='company-header'>
              <BPButton
                data-cy='save-profile'
                label='bp.action.save'
                onClick={handleSubmit}
                isLoading={isUpldateBusinessJobLoading || isUpldateGlobalInformation || isaccountHolderProvider || isUpdateFeedbackLink}
                className='save-information-button'
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </FormProvider>
  );
};
