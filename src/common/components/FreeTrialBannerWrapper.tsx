import { BPButton, FlexBox, SubscriptionModal } from '@/common/components';
import { useOptimisticCreditBalanceStore } from '@/common/store';
import { useGetCreditBalance } from '@/operations/account/queries';
import { whoami } from '@/providers';
import { Whoami } from '@bpartners/typescript-client';
import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { FC, PropsWithChildren } from 'react';
import { useDialog } from '../store/dialog';

export const FreeTrialBannerWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { open: openDialog } = useDialog();
  const { data: whoamiValue } = useQuery<Whoami>({
    queryFn: () => whoami(),
    queryKey: ['whoami', 'user'],
  });

  const today = dayjs();
  const isFreeTrialSubscription = whoamiValue?.user?.subscription?.status === 'FREE_TRIAL';
  const remainingDays = dayjs(whoamiValue?.user?.subscription?.end).diff(today, 'day');
  const { balance } = useGetCreditBalance(isFreeTrialSubscription);
  const optimisticBalance = useOptimisticCreditBalanceStore(state => state.balance);
  const remainingAnalyses = (optimisticBalance ?? balance)?.estimatedRemainingAnalyses ?? 0;

  const handleDoSubscription = () => {
    openDialog(<SubscriptionModal allowClose />, { maxWidth: 'lg', fullWidth: true }, true);
  };

  return isFreeTrialSubscription ? (
    <Box sx={{ width: '100%', height: '100%' }}>
      {' '}
      <FlexBox sx={{ mb: 1, bgcolor: '#f5f25dF0', px: 4, transform: 'translateY(-4px)', justifyContent: 'space-between', width: '100%' }}>
        {' '}
        <Typography
          sx={{
            color: '#f71b31',
            fontWeight: 'bold',
            position: 'sticky',
            fontSize: '1rem',
          }}
        >
          Il vous reste {remainingDays} jour{remainingDays > 1 ? 's' : ''} d'essai et {remainingAnalyses} analyse{remainingAnalyses > 1 ? 's' : ''} toiture
          {remainingAnalyses > 1 ? 's' : ''}.
        </Typography>
        <FlexBox sx={{ gap: 2 }}>
          <Typography
            sx={{
              color: '#f71b31',
              position: 'sticky',
              fontSize: '1rem',
            }}
          >
            Débloquer toutes les fonctionnalités IA pour les couvreurs
          </Typography>
          <BPButton onClick={handleDoSubscription} style={{ width: 'auto' }} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }} label="S'abonner" />
        </FlexBox>
      </FlexBox>
      {children}
    </Box>
  ) : (
    children
  );
};
