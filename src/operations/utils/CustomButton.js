import { Button, makeStyles } from '@material-ui/core';

const useStyle = makeStyles(() => ({
  button: {
    width: 300,
  },
}));

export const CustomButton = ({ onClick, label, icon, type, className }) => {
  const classes = useStyle();
  return (
    <Button type={type || 'button'} color='primary' className={className || classes.button} onClick={onClick} variant='contained' startIcon={icon}>
      {label}
    </Button>
  );
};
