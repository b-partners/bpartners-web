import { defaultTheme } from 'react-admin';

const important = value => `${value} !important`;

export const BP_COLOR = {
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
  '&:hover, &:active': {
    backgroundColor: BP_COLOR['20'],
    textDecoration: 'underline',
  },
  '&:disabled': {
    backgroundColor: BP_COLOR[40],
  },
};

export const BP_THEME = {
  ...defaultTheme,
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '.MuiInputBase-root': {
            padding: 0,
          },
          '.MuiIconButton-root': {
            position: 'absolute',
            right: '0.4rem',
          },
        },
      },
    },
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
          '& .RaLayout-content': {
            marginTop: '1rem',
            zIndex: 1,
            width: '98%',
            padding: '1%',
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
    MuiTableRow: {
      styleOverrides: {
        root: {
          height: 50,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          '&.MuiTableCell-head': {
            backgroundColor: BP_COLOR[10],
            color: 'white',
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
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: BP_BUTTON,
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
            color: `${BP_COLOR[10]} !important`,
          },
          borderBottom: `1px solid ${BP_COLOR['solid_grey']}`,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&.Mui-checked': {
            color: `${BP_COLOR[5]} !important`,
          },
        },
      },
    },
  },
};
