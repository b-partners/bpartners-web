import { createTheme } from '@material-ui/core/styles';
import { defaultTheme } from 'react-admin';

export const mainTheme = createTheme({
  ...defaultTheme,
  sidebar: {
    width: 175,
  },
  palette: {
    secondary: {
      main: '#F80',
    },
    primary: {
      main: '#069',
    }
  },
  typography: {
    fontFamily: ['sans-serif'].join(','),
    fontSize: 13,
  }
  // shadows: Array(25).fill('none')
});
