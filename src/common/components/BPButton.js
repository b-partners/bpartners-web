import { Button } from '@mui/material';

export const BPButton = props => {
  const { label, icon, style, ...others } = props;
  const width = style && style.width ? style.width : 300;

  return (
    <Button style={{ ...style, width }} {...others} color='primary' variant='contained' startIcon={icon}>
      {label}
    </Button>
  );
};
