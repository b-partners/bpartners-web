import { PALETTE_COLORS } from '@/bp-theme';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { Link, useTranslate } from 'react-admin';

export type BPButtonTemplateProps = ButtonProps & {
  isLoading?: boolean;
  label: string;
  icon?: React.ReactElement;
  colorType?: keyof typeof PALETTE_COLORS;
};

const BPButtonTemplate = (props: BPButtonTemplateProps) => {
  const translate = useTranslate();
  const { label, icon, style, isLoading, endIcon, colorType, ...others } = props;
  const width = style?.width ? style.width : 300;

  return (
    <Button
      disabled={isLoading}
      endIcon={isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : endIcon}
      style={{ background: colorType ? PALETTE_COLORS[colorType] : undefined, ...style, width }}
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
