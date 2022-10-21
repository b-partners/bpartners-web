import { Card, CardContent, Grid, TextField, Typography } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';
import { payingApi } from 'src/providers/api';
import authProvider from 'src/providers/auth-provider';
import { singleAccountGetter } from 'src/providers/account-provider';

const TransactionChart = () => {
  const [data, setData] = useState([]);

  const currentDate = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState({ startDate: currentDate, endDate: currentDate });

  const changeDate = e => {
    const { name, value } = e.target;
    setDate({
      ...date,
      [name]: value,
    });
  };

  useEffect(() => {
    const getTransactionCategoriesData = async () => {
      const userId = authProvider.getCachedWhoami().user.id;
      const accountId = (await singleAccountGetter(userId)).id;

      return (await payingApi().getTransactionCategories(accountId, true, date.startDate, date.endDate)).data;
    };

    const mapData = async () => {
      const transactionCategories = await getTransactionCategoriesData();

      setData(transactionCategories.map(({ type, count }) => ({ name: type, value: count })));
    };

    mapData();
  }, [date]);

  const COLORS = ['#4472CA', '#21FA90', '#FCDC4D', '#4B2840', '#FA8334', '#EF2D56'];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill='white' textAnchor={x > cx ? 'start' : 'end'} dominantBaseline='central'>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardContent>
        <Typography variant='h5'>Résumé Graphique</Typography>
      </CardContent>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item sm={2}>
            <Typography variant='subtitle1'>Filtrer par date</Typography>
            <TextField
              id='date'
              variant='filled'
              margin='dense'
              name='startDate'
              label='Date de debut'
              type='date'
              value={date.startDate}
              fullWidth
              onChange={e => {
                changeDate(e);
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              id='dateFin'
              variant='filled'
              margin='dense'
              name='endDate'
              label='Date de fin'
              type='date'
              value={date.endDate}
              fullWidth
              onChange={e => {
                changeDate(e);
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item>
            <PieChart width={700} height={300}>
              <Pie data={data} cx={200} cy={150} labelLine={false} label={renderCustomizedLabel} outerRadius={100} fill='#8884d8' dataKey='value'>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
