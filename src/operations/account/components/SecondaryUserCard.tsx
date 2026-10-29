import { useOptimisticCreditBalanceStore } from '@/common/store';
import { useGetCreditBalance } from '@/operations/account/queries';
import { Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { formatCredits } from './billing/utils';
import { SecondaryUserCardStyle } from './style';

export const SecondaryUserCard = () => {
  const { balance, isBalanceLoading } = useGetCreditBalance();
  const optimisticBalance = useOptimisticCreditBalanceStore(state => state.balance);
  const displayedBalance = optimisticBalance ?? balance;

  return (
    <Card className='card' sx={SecondaryUserCardStyle}>
      <CardContent>
        <Typography className='section-title'>Abonnement et crédits</Typography>
        <Typography className='secondary-user-status'>Vous utilisez l'abonnement et les crédits de votre compte principal.</Typography>
        {isBalanceLoading && !displayedBalance ? (
          <CircularProgress size={18} />
        ) : (
          <>
            <Typography className='secondary-user-credits'>{formatCredits(displayedBalance?.spendableCredits)}</Typography>
            <Typography className='secondary-user-credits-label'>Crédits disponibles</Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};
