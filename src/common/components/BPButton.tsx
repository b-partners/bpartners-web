import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { Link, useTranslate } from 'react-admin';

export type BPButtonTemplateProps = ButtonProps & {
  isLoading?: boolean;
  label: string;
  icon?: React.ReactElement;
};

const BPButtonTemplate = (props: BPButtonTemplateProps) => {
  const translate = useTranslate();
  const { label, icon, style, isLoading, endIcon, ...others } = props;
  const width = style?.width ? style.width : 300;

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

export const BPButton = (props: BPButtonTemplateProps) => {
  const { href, ...others } = props;
  return href ? (
    <Link to={href}>
      <BPButtonTemplate {...others} />
    </Link>
  ) : (
    <BPButtonTemplate {...others} />
  );
};
