import { Container, makeStyles, Typography } from '@material-ui/core';
import errorImg from '../../assets/img/errorImg.png';

const useStyles = makeStyles(() => ({
  container: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
  },
  image: {
    maxWidth: '30%',
  },
}));

const ErrorShow = () => {
  const classes = useStyles();

  return (
    <Container className={classes.container}>
      <Container>
        <img src={errorImg} alt='' className={classes.image} />
        <Typography variant='h6' className={classes.typography}>Message d'erreur</Typography>
      </Container>
    </Container>
  );
};

export default ErrorShow;
