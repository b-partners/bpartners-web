import { Card, Typography } from '@material-ui/core';
import React from 'react';
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';

const TransactionChart = () => {
  const data = [
    { name: "Chiffre d'affaires", value: 400 },
    { name: 'Solde disponible', value: 300 },
    { name: 'Dépense', value: 300 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FE1C1C'];

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
      <Typography variant='h4'>Résumé Graphique</Typography>
      <PieChart width={400} height={300}>
        <Pie data={data} cx={200} cy={150} labelLine={false} label={renderCustomizedLabel} outerRadius={100} fill='#8884d8' dataKey='value'>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend iconType='circle' />
      </PieChart>
    </Card>
  );
};

export default TransactionChart;
