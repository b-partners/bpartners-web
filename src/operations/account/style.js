import { BP_COLOR } from '@/bp-theme';

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
  height: '25%',
  width: '100%',
  background: 'linear-gradient(25deg, #ab0056 40% , #7A003DE0 100% )',
  zIndex: -1,
  borderRadius: '10px 10px 0 0',
};

export const FEEDBACK_LINK_TEXT = {
  width: 250,
  px: 1,
  overflowX: 'scroll',
  overflowY: 'hidden',
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '2px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    width: 200,
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '4px',
  },
  position: 'relative',
};

export const FEEDBACK_LINK_TEXT_CONTAINER = { display: 'flex', bgcolor: BP_COLOR['solid_grey'], alignItems: 'center', p: 1, width: 'fit-content' };
