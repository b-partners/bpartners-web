import { Button } from '@mui/material';

export const CustomButton = props => {
  const { label, icon, style, ...others } = props;
  return (
    <Button style={{ ...style, width: 300 }} {...others} color='primary' variant='contained' startIcon={icon}>
      {label}
    </Button>
  );
};
