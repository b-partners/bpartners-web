import { Card, CardContent, Checkbox, Grid, TextField, Typography } from '@mui/material';
import { useState } from 'react';

const companyFields = [
  { label: 'Raison sociale', defaultValue: 'Smart_IDF_Region' },
  { label: 'Encaissement annuelle à réaliser', defaultValue: 'Objectif non défini' },
  { label: 'Activité principale', defaultValue: 'Couvreur' },
  { label: 'Code postal' },
  { label: 'Activité secondaire' },
  { label: 'Code de la commune de prospection' },
  { label: 'Activité officielle' },
  { label: 'Numéro de TVA' },
  { label: 'Capital social', defaultValue: '0,00€' },
  { label: 'Site web' },
  { label: 'Siren', checkbox: true, defaultChecked: true, defaultValue: 'Micro-entreprise exonérée de TVA' },
  { label: 'Ville' },
  { label: 'Pays' },
  { label: 'Adresse' },
];

export const CompanyCard = () => {
  const [checkboxStates, setCheckboxStates] = useState(companyFields.map(field => field.defaultChecked || false));

  return (
    <Card className='card company-card'>
      <CardContent>
        <Typography className='section-title-company'>Ma société</Typography>
        <Grid container spacing={2}>
          {companyFields.map((field, index) => (
            <Grid item xs={12} sm={4} key={index}>
              {field.checkbox ? (
                <TextField
                  fullWidth
                  label={field.label}
                  defaultValue={field.defaultValue}
                  InputProps={{
                    endAdornment: (
                      <Checkbox
                        checked={checkboxStates[index]}
                        onChange={e => {
                          const newStates = [...checkboxStates];
                          newStates[index] = e.target.checked;
                          setCheckboxStates(newStates);
                        }}
                        color='success'
                      />
                    ),
                  }}
                  variant='outlined'
                />
              ) : (
                <TextField fullWidth label={field.label} defaultValue={field.defaultValue || 'A compléter'} />
              )}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
