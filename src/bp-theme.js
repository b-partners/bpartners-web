import { createTheme } from '@mui/material';
import { defaultTheme } from 'react-admin';

const important = value => `${value} !important`;

export const BP_COLOR = {
  2: '#ab005650',
  5: '#ab0056',
  10: '#7A003D',
  20: '#660033',
  30: '#582d37',
  40: '#F1E4E7',
  solid_grey: 'rgb(0, 0, 0, 0.05)',
};

export const BP_BUTTON = {
  color: '#fff',
  backgroundColor: BP_COLOR[10],
  margin: '5px',
  textTransform: 'unset',
  '&:hover, &:active': {
    backgroundColor: BP_COLOR['20'],
    cursor: 'pointer',
  },
  '&:disabled': {
    backgroundColor: BP_COLOR['solid_grey'],
  },
};

export const BP_THEME = {
  ...defaultTheme,
  palette: {
    background: {
      default: '#fafafb',
    },
    primary: {
      light: '#ab0056',
      main: '#7A003D',
      dark: '#660033',
      contrastText: '#fff',
    },
    secondary: {
      light: '#6ec6ff',
      main: '#2196f3',
      dark: '#0069c0',
      contrastText: '#fff',
    },
  },
  components: {
    MuiSideBar: {
      styleOverrides: {
        root: {
          closeWidth: 100,
        },
      },
    },
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          height: 40,
          marginLeft: 3,
          paddingLeft: '12px',
          borderRadius: '6px',
          '&.RaMenuItemLink-active': {
            backgroundColor: BP_COLOR[10],
            color: '#fff',
            borderLeft: '3px solid #fff',
          },
          '&.RaMenuItemLink-active .RaMenuItemLink-icon': {
            color: '#fff',
          },
          '& .RaMenuItemLink-icon': {
            margin: 0,
            padding: 0,
            minWidth: 0,
            marginRight: 20,
          },
        },
      },
    },
    RaLayout: {
      styleOverrides: {
        root: {
          paddingLeft: 2,
          marginTop: '1.5rem',
          '&. RaLayout-content': {
            marginTop: '2rem',
            zIndex: 1,
            width: '98%',
            padding: '1%',
          },
          '&. RaLayout-contentWithSidebar': {
            overflowY: important('scroll'),
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: 'none',
        },
        elevation2: {
          boxShadow: '1px 1px 8px rgba(0, 0, 0, 0.06) !important',
        },
        elevation3: {
          boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.1) !important',
        },
        root: {
          border: '1px solid #ebebeb',
          backgroundClip: 'padding-box',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: BP_COLOR[2],
        },
        barColorSecondary: {
          backgroundColor: BP_COLOR[5],
          color: BP_COLOR[5],
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          height: 50,
        },
      },
    },
    RaCalendar: {
      styleOverrides: {
        root: {
          '& .fc-button-primary:not(.fc-button-active, .fc-today-button)': {
            color: '#ffffff !important',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          '&.MuiTableCell-head': {
            backgroundColor: BP_COLOR[10],
            color: 'white',
            '.MuiCheckbox-root': {
              color: '#fff',
            },
            '.Mui-active': {
              color: '#fff',
            },
          },
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
          '& .RaList-main button': BP_BUTTON,
          '& .RaList-actions': {
            marginBottom: '5px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: BP_BUTTON,
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .Mui-checked': {
            color: important(BP_COLOR[10]),
            '& +.MuiSwitch-track': {
              backgroundColor: important(BP_COLOR[40]),
              opacity: 1,
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& 	.MuiTabs-indicator': {
            backgroundColor: BP_COLOR[5],
          },
          '& .Mui-selected': {
            color: important(BP_COLOR[10]),
          },
          borderBottom: `1px solid ${BP_COLOR['solid_grey']}`,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&.Mui-checked': {
            color: important(BP_COLOR[5]),
          },
        },
      },
    },
  },
};
