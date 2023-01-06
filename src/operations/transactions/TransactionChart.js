import { Box, Card, CardContent, Grid, TextField, Typography, Skeleton } from '@mui/material';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { payingApi } from 'src/providers/api';
import authProvider from 'src/providers/auth-provider';
import { singleAccountGetter } from 'src/providers/account-provider';

import emptyGraph from 'src/assets/noData.png';

import { prettyPrintMinors } from '../utils/money';

const TransactionChart = () => {
  const [data, setData] = useState([]);
  const [transactionsSummary, setTransactionsSummary] = useState();
  const [lastUpdateDate, setLastUpdateDate] = useState();

  const getAccountId = async () => {
    const userId = authProvider.getCachedWhoami().user.id;
    return (await singleAccountGetter(userId)).id;
  };

  const currentDate = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}`;
  const [currentBalance, setCurrentBalance] = useState();
  useEffect(() => {
    const updateBalance = async () => {
      const [currentYearString, currentMonthString] = currentDate.split('-');
      const currentYear = +currentYearString;
      const currentMonth = +currentMonthString;
      const accountId = await getAccountId();
      const { data } = await payingApi().getTransactionsSummary(accountId, currentYear);
      setCurrentBalance(data.summary.filter(item => item.month === currentMonth)[0].cashFlow);
    };
    updateBalance();
  }, []);

  const [date, setDate] = useState(currentDate);
  const [year, month] = date.split('-');

  const getTransactionsSummary = async year => {
    const accountId = await getAccountId();

    const { data } = await payingApi().getTransactionsSummary(accountId, year);
    setTransactionsSummary(data);
  };

  const getMonthlyTransaction = month => {
    const transactionOfTheMonth = transactionsSummary && transactionsSummary.summary.filter(item => item.month === +month)[0];

    setLastUpdateDate(transactionOfTheMonth && transactionOfTheMonth.updatedAt);
    transactionOfTheMonth
      ? setData([
          { name: 'Recette', value: transactionOfTheMonth.income },
          { name: 'Dépense', value: transactionOfTheMonth.outcome },
          { name: 'Trésorerie', value: transactionOfTheMonth.cashFlow },
        ])
      : setData([]);
  };

  const checkTransactionsSummary = () => {
    const currentYear = transactionsSummary && transactionsSummary.year;

    currentYear !== +year && year.length === 4 ? getTransactionsSummary(+year) : getMonthlyTransaction(+month - 1);
  };

  useEffect(() => {
    checkTransactionsSummary();
  }, [date]);

  useEffect(() => {
    getMonthlyTransaction(+month - 1);
  }, [transactionsSummary]);

  const COLORS = ['#1D9661', '#B30000', '#003D7A'];

  return (
    <Card sx={{ border: 0 }}>
      <CardContent>
        <Typography variant='h6'>Solde du jour : {currentBalance ? prettyPrintMinors(currentBalance) : '...'}</Typography>
        <Grid container spacing={1}>
          <Grid item sm={3}>
            {transactionsSummary ? (
              <TextField
                type='month'
                id='date'
                variant='filled'
                value={date}
                onChange={e => {
                  setDate(e.target.value);
                }}
              />
            ) : (
              <Skeleton width={210} height={60} />
            )}
            {lastUpdateDate && (
              <Box mt={2}>
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
                    Vous n'avez aucune transaction sur ce mois
                  </Typography>
                </Box>
              ) : (
                <PieChart width={500} height={150}>
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
      </CardContent>
    </Card>
  );
};

export default TransactionChart;
