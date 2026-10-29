import { useOptimisticCreditBalanceStore } from '@/common/store';
import { useGetCreditBalance, useOptimisticBalanceReconciliation } from '@/operations/account/queries';
import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { formatCredits, hasSpendableCredits } from './billing/utils';
import { SecondaryUserCardStyle } from './style';

export const SecondaryUserCard = () => {
  const { balance, isBalanceLoading, refetchBalance } = useGetCreditBalance();
  useOptimisticBalanceReconciliation(refetchBalance);
  const optimisticBalance = useOptimisticCreditBalanceStore(state => state.balance);
  const displayedBalance = optimisticBalance ?? balance;
  const slices = [
    { key: 'granted', value: displayedBalance?.grantedCredits ?? 0 },
    { key: 'purchased', value: displayedBalance?.purchasedCredits ?? 0 },
  ].filter(({ value }) => value > 0);

  return (
    <Card className='card' sx={SecondaryUserCardStyle}>
      <CardContent>
        <Typography className='section-title'>Abonnement et crédits</Typography>
        {isBalanceLoading && !displayedBalance ? (
          <CircularProgress size={18} />
        ) : (
          <Box className='secondary-user-credits-overview'>
            <Box className='secondary-user-credits-chart' data-cy='secondary-user-credits-chart'>
              {slices.length === 0 ? (
                <Box className='secondary-user-credits-chart-empty' />
              ) : (
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={slices}
                      dataKey='value'
                      innerRadius='72%'
                      outerRadius='100%'
                      paddingAngle={slices.length > 1 ? 3 : 0}
                      stroke='none'
                      isAnimationActive={false}
                    >
                      {slices.map(({ key }) => (
                        <Cell key={key} className={`secondary-user-credits-slice--${key}`} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
              <Typography component='span' className='secondary-user-credits'>
                {formatCredits(displayedBalance?.spendableCredits)}
              </Typography>
            </Box>
            <Box className='secondary-user-credits-details'>
              <Typography className='secondary-user-credits-label'>Crédits disponibles</Typography>
              <Typography className='secondary-user-status'>Vous utilisez l'abonnement et les crédits de votre compte principal.</Typography>
              {!hasSpendableCredits(displayedBalance) && (
                <Typography className='secondary-user-no-credits' data-cy='secondary-user-no-credits'>
                  Vous n'avez plus de crédits : contactez le titulaire du compte principal pour recharger le compte.
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
