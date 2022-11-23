import { Button } from '@material-ui/core';

export const CustomButton = props => {
  const { label, icon, style, ...others } = props;
  return (
    <Button style={{ ...style, width: 300 }} {...others} color='primary' variant='contained' startIcon={icon}>
      {label}
    </Button>
  );
};
