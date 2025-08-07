import { defaultTheme } from 'react-admin';

const important = value => `${value} !important`;

export const PALETTE_COLORS = {
  pine: '#4A644E',
  peach: '#FFB179',
  linen: '#BEB4A4',
  white: '#FFFFFF',
  black: '#1F1F1F',
  cream: '#F0ECE1',
  forest: '#112717',
  neon_orange: '#FF521B',
};

export const BP_COLOR = {
  2: `#f7a88d`,
  5: `#FF521B`,
  10: `#e8683c`,
  20: `#f26230`,
  30: `${PALETTE_COLORS.neon_orange}`,
  40: `${PALETTE_COLORS.neon_orange}`,
  solid_grey: 'rgb(0, 0, 0, 0.05)',
};

const bp_button = {
  paddingInline: '10px',
  boxShadow: 'unset',
  minWidth: '10rem',
  color: '#fff',
  backgroundColor: PALETTE_COLORS.neon_orange,
  marginBlock: '5px',
  textTransform: 'unset',
  '&:hover, &:active': {
    backgroundColor: BP_COLOR[20],
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
      light: PALETTE_COLORS.neon_orange,
      main: PALETTE_COLORS.neon_orange,
      dark: PALETTE_COLORS.neon_orange,
      contrastText: '#fff',
    },
    secondary: {
      light: PALETTE_COLORS.pine,
      main: PALETTE_COLORS.pine,
      dark: PALETTE_COLORS.pine,
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
            backgroundColor: BP_COLOR[5],
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
          backgroundColor: PALETTE_COLORS.white,
        },
        barColorSecondary: {
          backgroundColor: PALETTE_COLORS.pine,
          color: PALETTE_COLORS.pine,
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
          '& .RaList-main button': {
            color: '#fff',
            backgroundColor: BP_COLOR[5],
            margin: '5px',
            textTransform: 'unset',
            '&:hover, &:active': {
              backgroundColor: BP_COLOR['20'],
              cursor: 'pointer',
            },
            '&:disabled': {
              backgroundColor: BP_COLOR['solid_grey'],
            },
          },
          '& .RaList-actions .MuiButton-root': bp_button,
          '& .RaList-actions': {
            padding: '10px 5px 5px 10px',
          },
          '& .RaDatagrid-headerCell': {
            backgroundColor: PALETTE_COLORS.pine,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: bp_button,
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
            color: important(BP_COLOR[5]),
            '& +.MuiSwitch-track': {
              backgroundColor: important(BP_COLOR[5]),
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
