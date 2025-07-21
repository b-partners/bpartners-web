import { Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import { useRecordContext } from 'react-admin';
import { getCompanyFields } from './CompanyFields';

export const CompanyCard = () => {
  const record = useRecordContext();
  const fields = getCompanyFields(record);

  return (
    <Card className='card company-card'>
      <CardContent>
        <Typography className='section-title-company'>Ma société</Typography>
        <Grid container spacing={2}>
          {fields.map((field, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <TextField fullWidth label={field.label} value={field.value ?? 'A compléter'} InputProps={{ readOnly: true }} variant='outlined' />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
