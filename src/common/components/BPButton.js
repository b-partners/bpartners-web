import { Button } from '@mui/material';
import { Link, useTranslate } from 'react-admin';

const _BPButton = props => {
  const translate = useTranslate();
  const { label, icon, style, ...others } = props;
  const width = style && style.width ? style.width : 300;

  return (
    <Button style={{ ...style, width }} {...others} color='primary' variant='contained' startIcon={icon}>
      {translate(label)}
    </Button>
  );
};

export const BPButton = ({ href, ...others }) => {
  return href ? (
    <Link to={href}>
      <_BPButton {...others} />
    </Link>
  ) : (
    <_BPButton {...others} />
  );
};
