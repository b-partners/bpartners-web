import { Login } from 'react-admin';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import { Typography } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { mainTheme } from '../haTheme';
import CompletePasswordPage from './CompletePasswordPage';
import authProvider from '../providers/auth-provider';

const aCard = (title, subtitle, description1, description2, course) => {
  const syllabus = 'https://drive.google.com/file/d/12Lc4o3jfQOFHIzazPToO2hnGZc8epU3I/view';
  return (
    <Card style={{ backgroundColor: '#ffffff', opacity: 0.9 }}>
      <CardContent>
        <Typography variant='h3' color='primary'>
          {title}
        </Typography>
        <Typography variant='h5' color='primary'>
          {subtitle}
        </Typography>
        <Typography variant='h7' color='initial'>
          {description1}
          <br />
          {description2}
        </Typography>
        <Typography variant='h8' color='initial'>
          <p>
            Cours :{' '}
            <a href={syllabus} style={{ color: '#000000' }}>
              {course}
            </a>
          </p>
        </Typography>
      </CardContent>
    </Card>
  );
};

const HaLoginPage = () => {
  return <p>Login</p>;
};

export default HaLoginPage;
