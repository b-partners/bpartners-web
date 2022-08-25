import { Container, makeStyles, Typography } from '@material-ui/core';
import { red } from '@material-ui/core/colors';
import {useLocation} from "react-router-dom"; 
import getParams from "../utils/getParams";
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
  typography: {
    color: red["A200"],
    marginTop: "1.5rem"
  }
}));

const ErrorShow = () => {
  const classes = useStyles();
  const location = useLocation()
  const message = getParams(location.search, "message");
  
  return (
    <Container className={classes.container}>
      <Container>
        <img src={errorImg} alt='' className={classes.image} />
        <Typography variant='h6' className={classes.typography} paragraphe>{message}</Typography>
      </Container>
    </Container>
  );
};

export default ErrorShow;
