import { Box, Card, CardContent, Grid, LinearProgress, Typography, Skeleton, Switch } from '@mui/material';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { payingApi } from 'src/providers/api';
import authProvider from 'src/providers/auth-provider';
import { getCachedAccount, singleAccountGetter } from 'src/providers/account-provider';
import emptyGraph from 'src/assets/noData.png';

import { toMajors, prettyPrintMinors as prettyPrintPercentMinors, toMinors } from '../../common/utils/percent';
import { prettyPrintMinors } from '../../common/utils/money';
import { BP_SWITCH_STYLE } from '../account/style';
import BPDatePicker from '../../common/components/BPDatePicker';
import { BP_COLOR } from 'src/bp-theme';
import useGetAccountHolder from '../../common/hooks/use-get-account-holder';

const AnnualTargetGraph = ({ year }) => {
  const revenueTargets = useGetAccountHolder().revenueTargets;
  const currentRevenueTargets = revenueTargets ? revenueTargets.filter(item => item.year === year)[0] : false;

  const printAmountAttemptedPercent = amountAttemptedPercent => {
    const additionalPercent = toMajors(amountAttemptedPercent) > 100 ? toMajors(amountAttemptedPercent) % 100 : 0;

    return additionalPercent > 0
      ? `100 % atteint. +${prettyPrintPercentMinors(toMinors(additionalPercent))}`
      : `${prettyPrintPercentMinors(amountAttemptedPercent)} atteint`;
  };

  return (
    <Box sx={{ width: '60%', mt: 4, mx: 'auto', textAlign: 'center' }}>
      {currentRevenueTargets ? (
        <>
          <Typography variant='h6'>Objectif annuel ({printAmountAttemptedPercent(currentRevenueTargets.amountAttemptedPercent)})</Typography>
          <Typography variant='body1' fontWeight='bold'>
            Recette de cette année : {prettyPrintMinors(currentRevenueTargets.amountAttempted)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress
                variant='determinate'
                value={toMajors(currentRevenueTargets.amountAttemptedPercent) > 100 ? 100 : toMajors(currentRevenueTargets.amountAttemptedPercent)}
                sx={{
                  height: 25,
                  borderRadius: 2,
                  backgroundColor: BP_COLOR[40],
                  '& .MuiLinearProgress-barColorPrimary': {
                    backgroundColor: BP_COLOR[10],
                  },
                }}
              />
            </Box>
            <Box sx={{ minWidth: 100 }}>
              <Typography variant='body2' color='text.secondary'>
                {currentRevenueTargets.amountTarget ? prettyPrintMinors(currentRevenueTargets.amountTarget) : '...'}
              </Typography>
            </Box>
          </Box>
        </>
      ) : (
        <Typography variant='body2' color='text.secondary'>
          {currentRevenueTargets === false
            ? `Chargement...`
            : `Vous n'avez pas défini d'objectif pour cette année. Veuillez accéder à l'onglet mon compte pour définir votre objectif annuel.`}
        </Typography>
      )}
    </Box>
  );
};

const TransactionChart = () => {
  const [data, setData] = useState([]);
  const [transactionsSummary, setTransactionsSummary] = useState();
  const [lastUpdateDate, setLastUpdateDate] = useState();

  const [annualSummary, isAnnualSummary] = useState(true);

  const getAccountId = async () => {
    const userId = authProvider.getCachedWhoami().user.id;
    return getCachedAccount() ? getCachedAccount().id : (await singleAccountGetter(userId)).id;
  };

  const currentDate = { year: new Date().getFullYear(), month: new Date().getMonth() };
  const [currentBalance, setCurrentBalance] = useState();
  useEffect(() => {
    const updateBalance = async () => {
      const currentYear = currentDate.year;
      const currentMonth = currentDate.month;
      const accountId = await getAccountId();
      const { data } = await payingApi().getTransactionsSummary(accountId, currentYear);
      data && setCurrentBalance(data.summary.filter(item => item.month === currentMonth)[0].cashFlow);
    };
    updateBalance();
  }, []);

  const [date, setDate] = useState(currentDate);

  const getTransactionsSummary = async year => {
    const accountId = await getAccountId();

    const { data } = await payingApi().getTransactionsSummary(accountId, year);
    setTransactionsSummary(data);
  };

  const getMonthlyTransaction = month => {
    const transactionOfTheMonth = transactionsSummary && transactionsSummary.summary.filter(item => item.month === month)[0];

    setLastUpdateDate(transactionOfTheMonth && transactionOfTheMonth.updatedAt);
    transactionOfTheMonth
      ? setData([
          { name: 'Recette', value: transactionOfTheMonth.income },
          { name: 'Dépense', value: transactionOfTheMonth.outcome },
          { name: 'Trésorerie', value: transactionOfTheMonth.cashFlow },
        ])
      : setData([]);
  };

  const getAnnualSummary = () => {
    setLastUpdateDate(transactionsSummary && transactionsSummary.updatedAt);
    transactionsSummary && transactionsSummary.summary.length !== 0
      ? setData([
          { name: `Recette ${transactionsSummary.year}`, value: transactionsSummary.annualIncome },
          { name: `Dépense ${transactionsSummary.year}`, value: transactionsSummary.annualOutcome },
          { name: `Trésorerie ${transactionsSummary.year}`, value: transactionsSummary.annualCashFlow },
        ])
      : setData([]);
  };

  const checkTransactionsSummary = () => {
    const currentYear = transactionsSummary && transactionsSummary.year;
    const { year, month } = date;

    if (currentYear !== year && `${year}`.length === 4) {
      getTransactionsSummary(year);
    } else {
      annualSummary ? getAnnualSummary() : getMonthlyTransaction(month);
    }
  };

  useEffect(() => {
    checkTransactionsSummary();
  }, [date, annualSummary]);

  useEffect(() => {
    transactionsSummary && annualSummary ? getAnnualSummary() : getMonthlyTransaction(date.month);
  }, [transactionsSummary]);

  const COLORS = ['#1D9661', '#B30000', '#003D7A'];

  return (
    <Card sx={{ border: 0 }}>
      <CardContent>
        <Typography align='center' mr={12} variant='h6' fontWeight='bold'>
          Solde du jour : {currentBalance ? prettyPrintMinors(currentBalance) : '...'}
        </Typography>
        <Box sx={{ textAlign: 'end', paddingX: 10 }}>
          <Typography variant='body1'>
            Vue mensuelle <Switch checked={annualSummary} id='annualSummarySwitch' onChange={e => isAnnualSummary(e.target.checked)} sx={BP_SWITCH_STYLE} /> Vue
            annuelle
          </Typography>
        </Box>
        <Grid container spacing={1}>
          <Grid item sm={3}>
            {transactionsSummary ? (
              <Box>
                <BPDatePicker
                  views={annualSummary ? ['year'] : ['year', 'month']}
                  label={annualSummary ? 'Sélectionnez une année' : 'Sélectionnez un mois'}
                  setDate={setDate}
                />
              </Box>
            ) : (
              <Skeleton width={210} height={60} />
            )}
            {lastUpdateDate && (
              <Box mt={2} mx={2}>
                <Typography variant='body1'>
                  <i>Dernière modification</i>
                </Typography>
                <Typography variant='body2'>
                  <i>{lastUpdateDate.split('T').join(' ').split('.')[0]}</i>
                </Typography>
              </Box>
            )}
          </Grid>
          {transactionsSummary ? (
            <Grid item>
              {data.length === 0 || data.filter(item => item.value === 0).length === 3 ? (
                <Box textAlign='center'>
                  <img src={emptyGraph} alt='aucune transaction' height={120} />
                  <Typography variant='body1' mt={2}>
                    Vous n'avez pas de transaction sur cette période.
                  </Typography>
                </Box>
              ) : (
                <PieChart width={600} height={150}>
                  <Pie
                    data={data}
                    cx={200}
                    cy={150}
                    outerRadius={100}
                    innerRadius={82}
                    fill='#8884d8'
                    nameKey='name'
                    dataKey='value'
                    label={data => prettyPrintMinors(data.value)}
                    startAngle={180}
                    endAngle={0}
                    paddingAngle={4}
                  >
                    {data.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconType='circle' verticalAlign='bottom' layout='vertical' align='right' />
                </PieChart>
              )}
            </Grid>
          ) : (
            <Grid item>
              <Skeleton variant='rounded' width={300} height={110} />
            </Grid>
          )}
        </Grid>
        <AnnualTargetGraph year={date.year} />
      </CardContent>
    </Card>
  );
};

export default TransactionChart;
