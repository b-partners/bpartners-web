import { Save as SaveIcon } from '@mui/icons-material';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { BpFormField } from 'src/common/components';
import { updateBankInformation } from 'src/providers/account-provider';
import { BIC_MESSAGE_CONTAINER } from './style';

export const BankInformationForm = props => {
  const {
    account: { name, bic, iban },
    setAccount,
  } = props;
  const form = useForm({ mode: 'all', defaultValues: { name, bic, iban } });
  const [isLoading, setLoading] = useState(false);
  const notify = useNotify();
  const refresh = useRefresh();

  const handleSubmit = form.handleSubmit(async bankInfo => {
    setLoading(true);
    try {
      const newAccount = await updateBankInformation(bankInfo);
      refresh();
      setAccount(newAccount);
    } catch {
      notify("Une erreur s'est produite", { type: 'error' });
    } finally {
      setLoading(false);
    }
  });

  return (
    <Box>
      <Paper sx={BIC_MESSAGE_CONTAINER}>
        <Typography variant='p' component='div' sx={{ margin: 2 }}>
          Pour finaliser votre synchronisation de compte bancaire, veuillez renseigner votre BIC présent sur votre RIB et enregistrer.
        </Typography>
      </Paper>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <BpFormField name='name' label='Nom du compte' />
          <BpFormField name='bic' label='BIC' />
          <BpFormField name='iban' label='IBAN' />
          <Button type='submit' sx={{ width: 300, marginTop: 1 }} disabled={isLoading} startIcon={<SaveIcon />}>
            Enregistrer
          </Button>
        </form>
      </FormProvider>
    </Box>
  );
};
