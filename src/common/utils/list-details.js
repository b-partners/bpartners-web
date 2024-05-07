import { Typography } from '@mui/material';

export const listDetails = (label, value, unity = '') => {
  return (
    <Typography variant='body2'>
      {label} :{' '}
      <Typography component='span' fontWeight={'bold'}>
        {value ? value + ' ' + unity : 'Non renseigné'}
      </Typography>
    </Typography>
  );
};
