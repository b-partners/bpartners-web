import { Card, CardContent, Grid, TextField, Typography } from '@material-ui/core';
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

  const COLORS = ['#0088FE', '#00C49F', '#F11C1C', '#5E12A4', '#A5FA20', '#F5A213'];

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
          <Grid item>
            <TextField
              id='date'
              name='startDate'
              label='Date de debut'
              type='date'
              value={date.startDate}
              onChange={e => {
                changeDate(e);
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item>
            <TextField
              id='dateFin'
              name='endDate'
              label='Date de fin'
              type='date'
              value={date.endDate}
              onChange={e => {
                changeDate(e);
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
      <CardContent>
        <PieChart width={400} height={300}>
          <Pie data={data} cx={200} cy={150} labelLine={false} label={renderCustomizedLabel} outerRadius={100} fill='#8884d8' dataKey='value'>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend iconType='circle' />
        </PieChart>
      </CardContent>
    </Card>
  );
};

export default TransactionChart;
