import { Card, CardContent, Grid, Paper, TextField, Typography } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';

const TransactionChart = () => {
  const data = [
    { name: "Chiffre d'affaires", value: 400 },
    { name: 'Solde disponible', value: 300 },
    { name: 'Dépense', value: 300 },
  ];
  // const [data, setData] = useState([]);

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
    console.log(date);
  }, [date]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

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
        <Typography variant='h4'>Résumé Graphique</Typography>
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
            <PieChart width={500} height={300}>
              <Pie data={data} cx={200} cy={150} labelLine={false} label={renderCustomizedLabel} outerRadius={130} fill='#8884d8' dataKey='value'>
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
