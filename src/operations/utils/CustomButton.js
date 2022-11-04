import { Button } from '@material-ui/core';

export const CustomButton = ({ onClick, label, icon, type, className, id }) => {
  return (
    <Button type={type || 'button'} style={{ width: 300 }} id={id} color='primary' className={className} onClick={onClick} variant='contained' startIcon={icon}>
      {label}
    </Button>
  );
};
