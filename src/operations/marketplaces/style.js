import { BP_COLOR } from '../../bpTheme';

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
  padding: '0.8rem 0 2rem 0',

  display: 'grid',
  gridTemplateRows: 'auto auto',
  rowGap: '0.7rem',

  borderBottom: `1px solid  ${BP_COLOR['solid_grey']}`,
  borderRadius: '.2rem',
};

export const AVATAR_STYLE = {
  height: '3em',
  width: '3em',
  border: '3px solid #fff',
  zIndex: 2,
};

const BACKDROP_COMMON_STYLE = {
  backgroundColor: '#7A003D',
  position: 'absolute',
  top: 0,
  left: 0,
  borderRadius: '.3rem',
};

export const BACKDROP_STYLE = {
  1: {
    ...BACKDROP_COMMON_STYLE,
    zIndex: 1,
    borderRadius: '0 0 50% 0',
    color: '#fff',
    paddingInline: '.6rem',
    display: 'flex',
    alignItems: 'center',
    height: '15%',
  },

  2: {
    ...BACKDROP_COMMON_STYLE,
    height: '100%',
    width: '2%',
  },
};

export const DETAIL_CONTAINER_STYLE = {
  padding: '0.6rem 0.3rem',
  color: 'grey',
  width: '100%',
};
