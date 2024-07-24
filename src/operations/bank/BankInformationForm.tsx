import { BpFormField } from '@/common/components';
import { handleSubmit } from '@/common/utils';
import { accountProvider } from '@/providers';
import { Account } from '@bpartners/typescript-client';
import { Save as SaveIcon } from '@mui/icons-material';
import { Box, Button, Paper, Typography } from '@mui/material';
import { FC, useState } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { BIC_MESSAGE_CONTAINER } from './style';

interface BankInformationFormProps {
  account: Account;
  setAccount: (account: Account) => void;
}

export const BankInformationForm: FC<BankInformationFormProps> = props => {
  const {
    account: { name, bic, iban },
    setAccount,
  } = props;
  const form = useForm({ mode: 'all', defaultValues: { name, bic, iban } });
  const [isLoading, setIsLoading] = useState(false);
  const notify = useNotify();
  const refresh = useRefresh();

  const updateBankInfoSubmit = form.handleSubmit(bankInfo => {
    const fetch = async () => {
      const newAccount = await accountProvider.updateOne(bankInfo);
      refresh();
      setAccount(newAccount);
    };
    setIsLoading(true);
    fetch()
      .catch(() => notify('messages.global.error', { type: 'error' }))
      .finally(() => setIsLoading(false));
  });

  return (
    <Box>
      <Paper sx={BIC_MESSAGE_CONTAINER}>
        <Typography variant='body1' component='div' sx={{ margin: 2 }}>
          Pour finaliser votre synchronisation de compte bancaire, veuillez renseigner votre BIC présent sur votre RIB et enregistrer.
        </Typography>
      </Paper>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(updateBankInfoSubmit)} style={{ display: 'flex', flexDirection: 'column' }}>
          <BpFormField name='name' label='Nom du compte' />
          <BpFormField name='bic' label='BIC' />
          <BpFormField name='iban' label='IBAN' />
          <Button type='submit' data-testid='submit-change-bank-info' sx={{ width: 300, marginTop: 1 }} disabled={isLoading} startIcon={<SaveIcon />}>
            Enregistrer
          </Button>
        </form>
      </FormProvider>
    </Box>
  );
};
