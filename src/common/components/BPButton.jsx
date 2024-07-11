import { Button, CircularProgress } from '@mui/material';
import { Link, useTranslate } from 'react-admin';

const BPButtonTemplate = props => {
  const translate = useTranslate();
  const { label, icon, style, isLoading, endIcon, ...others } = props;
  const width = style && style.width ? style.width : 300;

  return (
    <Button
      disabled={isLoading}
      endIcon={isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : endIcon}
      style={{ ...style, width }}
      {...others}
      color='primary'
      variant='contained'
      startIcon={icon}
    >
      {translate(label)}
    </Button>
  );
};

export const BPButton = props => {
  const { href, ...others } = props;
  return href ? (
    <Link to={href}>
      <BPButtonTemplate {...others} />
    </Link>
  ) : (
    <BPButtonTemplate {...others} />
  );
};
