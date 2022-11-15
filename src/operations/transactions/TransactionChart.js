import { Card, CardContent, Grid, TextField, Typography } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';
import { payingApi } from 'src/providers/api';
import authProvider from 'src/providers/auth-provider';
import { singleAccountGetter } from 'src/providers/account-provider';

const TransactionChart = () => {
  const [data, setData] = useState([]);
  const [transactionsSummary, setTransactionsSummary] = useState();

  const currentDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;
  const [date, setDate] = useState(currentDate);

  const randomColor = () => {
    const randomRGB = window.crypto.getRandomValues(new Uint8Array(3));

    return `rgb(${randomRGB[0]}, ${randomRGB[1]}, ${randomRGB[2]})`;
  };

  const getTransactionsSummary = async currentYear => {
    const userId = authProvider.getCachedWhoami().user.id;
    const accountId = (await singleAccountGetter(userId)).id;

    const { data } = await payingApi().getTransactionsSummary(accountId, currentYear);
    setTransactionsSummary(data);
  };

  const getMonthlyTransaction = month => {
    const temp = transactionsSummary && transactionsSummary.summary.filter(item => item.month === +month)[0];

    temp
      ? setData([
          { name: 'Recette', value: temp.income / 100 },
          { name: 'Dépense', value: temp.outcome / 100 },
          { name: 'Trésorerie', value: temp.cashFlow / 100 },
        ])
      : setData([]);
  };

  const checkTransactionsSummary = () => {
    const year = +date.split('-')[0];
    const month = +date.split('-')[1] - 1;

    transactionsSummary && transactionsSummary.year !== year ? getTransactionsSummary(year) : getMonthlyTransaction(month);
  };

  useEffect(() => {
    const year = +date.split('-')[0];
    getTransactionsSummary(year);
  }, []);

  useEffect(() => {
    const month = +date.split('-')[1] - 1;
    getMonthlyTransaction(month);
  }, [transactionsSummary]);

  const COLORS = [];

  return (
    <Card>
      <CardContent>
        <Typography variant='h5'>Résumé Graphique</Typography>
      </CardContent>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item sm={3}>
            <Typography variant='subtitle1'>Changer le moi et/ou l'année</Typography>
            <TextField type='month' id='date' variant='filled' value={date} onBlur={checkTransactionsSummary} onChange={e => setDate(e.target.value)} />
          </Grid>
          <Grid item>
            <PieChart width={500} height={150}>
              <Pie
                data={data}
                cx={200}
                cy={150}
                outerRadius={100}
                innerRadius={80}
                fill='#8884d8'
                nameKey='name'
                dataKey='value'
                startAngle={180}
                endAngle={0}
                paddingAngle={4}
                label
              >
                {data.map((entry, index) => (
                  <>
                    {COLORS.push(randomColor())}
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  </>
                ))}
              </Pie>
              <Tooltip />
              <Legend iconType='circle' verticalAlign='bottom' layout='vertical' align='right' />
            </PieChart>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TransactionChart;
