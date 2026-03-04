import { Box, Button, CircularProgress, DialogActions, DialogContent, DialogTitle, duration, Paper, Stack, Typography } from '@mui/material';

import { BpAutoCompleteBackend, BpFormField } from '@/common/components';
import { useMutateProspect } from '@/common/fetcher';
import { useDialog } from '@/common/store/dialog';
import { annotatorProvider, getCached } from '@/providers';
import { ProspectStatus } from '@bpartners/typescript-client';
import { Feed, LocationOn } from '@mui/icons-material';
import { motion, stagger, useAnimate } from 'motion/react';
import { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { v4 as uuidV4 } from 'uuid';
import { getImageDialogStyle } from './style';

interface GetImageDialogProps {
  address: string;
}

interface FormType {
  address: string;
  email?: string;
}

export const GetImageDialog: FC<GetImageDialogProps> = props => {
  const { mutate, isPending } = useMutateProspect();
  const { close } = useDialog();
  const form = useForm<FormType>({ defaultValues: { address: props.address } });
  const [scope, animate] = useAnimate();

  const startLoading = async () => {
    animate('.input-anime', { transform: 'translateX(100%)', opacity: 0, display: 'none' }, { duration: 0.5, delay: stagger(0.2, { from: 'last' }) });
    animate('.form-container', { height: '300px' }, { delay: 0.5, duration: 1 });
    animate('.flight-anime', { width: '47px', height: '47px', opacity: 1 }, { delay: 1.2 });
  };

  const createProspect = form.handleSubmit(data => {
    startLoading();
    // mutate({ ...data, id: uuidV4(), status: ProspectStatus.TO_CONTACT, email: data.email || getCached.accountHolder()?.companyInfo?.email });
  });

  return (
    <Box ref={scope} sx={getImageDialogStyle}>
      <DialogTitle>
        <Typography>Renseignez l'adresse de votre prospect ou votre client et analysez les images haute résolution de sa toiture.</Typography>
      </DialogTitle>
      <DialogContent>
        <FormProvider {...form}>
          <Stack className='form-container' spacing={1}>
            <Paper className='flight-anime' elevation={1}>
              <Feed />
            </Paper>
            <BpAutoCompleteBackend
              name='address'
              label='Adresse'
              fetcher={annotatorProvider.searchAddress}
              textFieldProps={{ variant: 'filled' }}
              className='input-anime'
            />
            <BpFormField className='input-anime' required={false} shouldValidate={false} name='name' label='Nom du prospect' />
            <BpFormField className='input-anime' required={false} shouldValidate={false} name='firstName' label='Prénom du prospect' />
            <BpFormField className='input-anime' required={false} shouldValidate={false} name='email' type='email' label='Email' />
            <BpFormField className='input-anime' required={false} shouldValidate={false} name='phone' label='Téléphone' />
            <BpFormField className='input-anime' required={false} shouldValidate={false} multiline rows={4} name='defaultComment' label='Commentaire' />
          </Stack>
        </FormProvider>
      </DialogContent>
      <DialogActions>
        <Button disabled={isPending} onClick={close}>
          Annuler
        </Button>
        <Button onClick={createProspect} disabled={isPending} startIcon={isPending && <CircularProgress color='inherit' size={18} />}>
          Générer l'image
        </Button>
      </DialogActions>
    </Box>
  );
};
