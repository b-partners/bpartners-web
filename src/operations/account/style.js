import { BP_COLOR } from 'src/bpTheme';

export const SHOW_LAYOUT_STYLE = {
  height: '100%',
  position: 'relative',
  borderRadius: '0',
  display: 'grid',
  gridTemplateColumns: '1fr 3fr 0',
  gap: '2rem',
  justifyContent: 'space-around',
  padding: '5rem 2rem 2rem 2rem',
};

export const BOX_CONTENT_STYLE = {
  backgroundColor: '#fff',
  width: '100%',
  height: '100%',
  borderRadius: '0.4rem',
  border: `1px solid ${BP_COLOR['solid_grey']}`,
};

export const ACCOUNT_HOLDER_STYLE = {
  height: '10rem',
  display: 'grid',
  padding: '1.3rem',
  rowGap: '1.2rem',
  justifyContent: 'center',
  borderBottom: `1px solid ${BP_COLOR['solid_grey']}`,
  alignItems: 'center',
};

export const BACKDROP_STYLE = {
  position: 'absolute',
  top: '0',
  left: '0',
  height: '22%',
  width: '100%',
  backgroundColor: BP_COLOR[10],
  zIndex: -1,
};

export const TAB_STYLE = {
  '& 	.MuiTabs-indicator': {
    backgroundColor: BP_COLOR[30],
  },
  '& .Mui-selected': {
    color: `${BP_COLOR[10]} !important`,
  },
  borderBottom: `1px solid ${BP_COLOR['solid_grey']}`,
};
