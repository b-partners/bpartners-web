import { BPButton, FlexBox } from '@/common/components';
import { whoami } from '@/providers';
import { Whoami } from '@bpartners/typescript-client';
import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { FC, PropsWithChildren } from 'react';
import { useRedirect } from 'react-admin';

export const FreeTrialBannerWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { data: whoamiValue } = useQuery<Whoami>({
    queryFn: () => whoami(),
    queryKey: ['whoami', 'user'],
  });
  const redirect = useRedirect();

  const today = dayjs();
  const isFreeTrialSubscription = whoamiValue?.user?.subscription?.status === 'FREE_TRIAL';
  const remainingDays = dayjs(whoamiValue?.user?.subscription?.end).diff(today, 'day');

  const goToAbonnmentPage = () => {
    close();
    redirect(`/account/${whoamiValue?.user?.id}?tab=abonnement`);
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
          Il vous reste {remainingDays} jour{remainingDays > 1 ? 's' : ''} d'essai !
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
          <BPButton onClick={goToAbonnmentPage} sx={{ maxWidth: '50px' }} label="M'abonner" />
        </FlexBox>
      </FlexBox>
      {children}
    </Box>
  ) : (
    children
  );
};
