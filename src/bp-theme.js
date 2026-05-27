import { defaultTheme } from 'react-admin';

export const importantCSS = value => `${value} !important`;

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

export const BORDER_RADIUS = {
  none: '0px',
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
};

const bp_button = {
  ...defaultTheme?.components?.MuiButton,
  borderRadius: '5px',
  fontWeight: 600,
  fontSize: '0.75rem',
  padding: '4px 10px',
  minHeight: '28px',
  lineHeight: 1.4,
  textTransform: 'unset',
  boxShadow: 'unset',
  transition: 'all 0.15s ease',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  '&:hover, &:active': {
    cursor: 'pointer',
    boxShadow: 'unset',
  },
  '&:disabled': {
    backgroundColor: BP_COLOR['solid_grey'],
  },
};

export const BP_THEME = {
  ...defaultTheme,
  typography: {
    fontSize: 12,
    fontFamily: defaultTheme.typography?.fontFamily,
    body1: { fontSize: '0.8125rem' },
    body2: { fontSize: '0.75rem' },
    subtitle1: { fontSize: '0.8125rem' },
    subtitle2: { fontSize: '0.75rem' },
    caption: { fontSize: '0.6875rem' },
    button: { fontSize: '0.75rem', fontWeight: 600, textTransform: 'none' },
  },
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
          height: 34,
          marginLeft: 3,
          paddingLeft: '10px',
          borderRadius: '5px',
          fontSize: '0.8125rem',
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
            marginRight: 14,
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
            overflowY: importantCSS('scroll'),
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
          height: 40,
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
          fontSize: '0.75rem',
          padding: '6px 12px',
          '&.MuiTableCell-head': {
            backgroundColor: BP_COLOR[10],
            color: 'white',
            fontSize: '0.75rem',
            padding: '6px 12px',
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
            margin: '3px',
            fontSize: '0.75rem',
            padding: '4px 10px',
            textTransform: 'unset',
            '&:hover, &:active': {
              backgroundColor: BP_COLOR['20'],
              cursor: 'pointer',
            },
            '&:disabled': {
              backgroundColor: BP_COLOR['solid_grey'],
            },
          },
          '& .RaList-actions .MuiButton-root': {
            ...bp_button,
            background: PALETTE_COLORS.neon_orange,
          },
          '& .RaList-actions .MuiButton-root:hover': {
            background: '#FF8A65',
          },
          '& .RaList-actions': {
            padding: '10px 5px 5px 10px',
          },
          '& .RaDatagrid-headerCell': {
            backgroundColor: importantCSS(PALETTE_COLORS.pine),
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: 'contained',
        color: 'primary',
        size: 'small',
        disableElevation: true,
      },
      styleOverrides: {
        root: bp_button,
        containedPrimary: {
          backgroundColor: PALETTE_COLORS.neon_orange,
          color: '#fff',
          '&:hover': {
            backgroundColor: '#e8431a',
          },
        },
        colorInherit: {
          backgroundColor: '#fff',
          color: '#1F1F1F',
          border: '1px solid #ebebeb',
          '&:hover': {
            borderColor: PALETTE_COLORS.neon_orange,
            color: PALETTE_COLORS.neon_orange,
            backgroundColor: '#fff',
          },
        },
        textInherit: {
          backgroundColor: 'transparent',
          color: '#1F1F1F',
          border: 'none',
          '&:hover': {
            backgroundColor: '#f0f0f0',
          },
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          padding: '4px',
        },
        sizeSmall: {
          padding: '3px',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
        },
        inputSizeSmall: {
          padding: '6px 10px',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          fontSize: '0.8125rem',
          padding: '6px 10px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
          minHeight: '32px',
          padding: '4px 12px',
        },
      },
    },
    MuiChip: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          fontSize: '0.6875rem',
          height: '22px',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '42px',
        },
        dense: {
          minHeight: '36px',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .Mui-checked': {
            color: importantCSS(BP_COLOR[5]),
            '& +.MuiSwitch-track': {
              backgroundColor: importantCSS(BP_COLOR[5]),
              opacity: 1,
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: '34px',
          '& 	.MuiTabs-indicator': {
            backgroundColor: BP_COLOR[5],
          },
          '& .Mui-selected': {
            color: importantCSS(BP_COLOR[10]),
          },
          borderBottom: `1px solid ${BP_COLOR['solid_grey']}`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          fontWeight: 600,
          minHeight: '34px',
          padding: '6px 12px',
          textTransform: 'none',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&.Mui-checked': {
            color: importantCSS(BP_COLOR[5]),
          },
        },
      },
    },
    MuiPopover: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
  },
};
