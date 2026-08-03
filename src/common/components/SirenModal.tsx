import { sirenResolver } from '@/common/resolvers';
import { getCached, updateGlobalInformation } from '@/providers';
import { Box, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { useNotify } from 'react-admin';
import { useForm } from 'react-hook-form';
import { useDialog } from '../store/dialog';
import { NOOP_FN } from '../utils/noop_fn';
import { BPButton } from './BPButton';
import { SirenModalStyle } from './style';

interface SirenModalProps {
  onSuccess?: () => void;
}

interface SirenFormValues {
  siren: string;
}

export const SirenModal: FC<SirenModalProps> = ({ onSuccess = NOOP_FN }) => {
  const { close } = useDialog();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SirenFormValues>({ resolver: sirenResolver, mode: 'onSubmit', defaultValues: { siren: '' } });

  const { mutate, isPending } = useMutation({
    mutationKey: ['accountHolder', 'siren'],
    mutationFn: async ({ siren }: SirenFormValues) => {
      const { name, officialActivityName, contactAddress } = getCached.accountHolder() || {};
      return await updateGlobalInformation({ name, siren, officialActivityName, contactAddress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountHolder'] });
      notify('messages.global.changesSaved', { type: 'success' });
      close();
      onSuccess();
    },
    onError: () => notify('messages.global.error', { type: 'error' }),
  });

  return (
    <>
      <DialogTitle>Insérer votre SIREN pour effectuer des analyses</DialogTitle>
      <DialogContent>
        <Box sx={SirenModalStyle}>
          <Typography className='siren-description'>Votre numéro SIREN, composé de 9 chiffres, est nécessaire avant de pouvoir lancer une analyse.</Typography>
          <TextField
            className='siren-input'
            label='SIREN'
            variant='outlined'
            autoFocus
            inputProps={{ maxLength: 9, inputMode: 'numeric', 'data-testid': 'siren-field-input' }}
            error={!!errors.siren}
            helperText={errors.siren?.message}
            {...register('siren')}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <BPButton data-testid='siren-later-btn' label='bp.action.notNow' onClick={close} disabled={isPending} style={{ width: 140 }} />
        <BPButton
          data-testid='siren-submit-btn'
          label='bp.action.save'
          onClick={handleSubmit(values => mutate(values))}
          isLoading={isPending}
          style={{ width: 140 }}
        />
      </DialogActions>
    </>
  );
};
