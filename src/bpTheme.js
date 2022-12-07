import { defaultTheme } from 'react-admin';

export const BP_COLOR = {
  10: '#7A003D',
  20: '#660033',
  30: '#582d37',
  40: '#F1E4E7',
  solid_grey: 'rgb(0, 0, 0, 0.05)',
};

const bpButton = {
  color: '#fff',
  backgroundColor: BP_COLOR[20],
  '&:hover, &:active': {
    backgroundColor: BP_COLOR['20'],
    textDecoration: 'underline',
  },
  '&:disabled': {
    backgroundColor: BP_COLOR[40],
  },
};

export const bpTheme = {
  ...defaultTheme,
  components: {
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          borderLeft: '3px solid transparent',
          '&.RaMenuItemLink-active': {
            backgroundColor: BP_COLOR[10],
            color: '#fff',
            borderLeft: '3px solid #fff',
          },
          '&.RaMenuItemLink-active .RaMenuItemLink-icon': {
            color: '#fff',
          },
          '& .RaMenuItemLink-icon': {
            color: BP_COLOR[30],
          },
        },
      },
    },
    RaLayout: {
      styleOverrides: {
        root: {
          '& .RaLayout-content': {
            marginTop: '1rem',
            paddingLeft: '0.5rem',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: 'none',
        },
        root: {
          border: '1px solid #ebebeb',
          backgroundClip: 'padding-box',
        },
      },
    },
    RaListToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          borderRadius: '0.4rem 0.4rem 0 0',
        },
      },
    },
    RaList: {
      styleOverrides: {
        root: {
          '& .RaList-main button': bpButton,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: bpButton,
      },
    },
  },
};
