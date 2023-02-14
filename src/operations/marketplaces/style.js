import { BP_COLOR } from '../../bp-theme';

export const BOX_CONTAINER_STYLE = {
  border: `1px solid ${BP_COLOR['solid_grey']}`,
  minHeight: '10rem',
  width: '100%',
  borderRadius: '0.2rem',
  position: 'relative',
  paddingTop: '1.8rem',
};

export const AVATAR_CONTAINER_STYLE = {
  height: '5.5rem',
  width: '100%',
  padding: '0.4rem 0 2rem 0',
  mb: 1,

  display: 'grid',
  gridTemplateRows: 'auto auto',
  rowGap: '0.7rem',

  borderRadius: '.2rem',
};

export const AVATAR_STYLE = {
  height: '4em',
  width: '4em',
  border: `3px solid ${BP_COLOR[10]}`,
  // backgroundColor: 'white',
  zIndex: 3,
};

const BACKDROP_COMMON_STYLE = {
  backgroundColor: BP_COLOR[10],
  position: 'absolute',
  top: 0,
  left: 0,
  borderRadius: '.3rem',
};

export const BACKDROP_STYLE = {
  1: {
    ...BACKDROP_COMMON_STYLE,
    borderRadius: '0 0 5rem 0',
    color: '#fff',
    paddingInline: '.6rem',
    display: 'flex',
    alignItems: 'center',
    width: '7rem',
    height: '7rem',
  },

  2: {
    ...BACKDROP_COMMON_STYLE,
    height: '100%',
    width: '2%',
  },
};

export const LINK_STYLE = {
  textDecoration: 'none',
  color: BP_COLOR[10],
  '&:hover': {
    textDecoration: 'underline',
  },
};

export const DETAIL_CONTAINER_STYLE = {
  padding: '0.6rem 0',
  color: 'grey',
  width: '100%',
};
