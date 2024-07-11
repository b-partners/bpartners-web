import { BP_COLOR } from '@/bp-theme';

export const ERROR_BOX_STYLE = {
  bgcolor: BP_COLOR[40],
  color: 'red',
  borderRadius: 2,
  p: 1,
  maxHeight: '5rem',
  overflow: 'scroll',
  '&::-webkit-scrollbar': { display: 'none' },
};

export const IMPORT_BUTTON_STYLE = {
  width: '10rem',
  paddingBlock: 1,
};

export const IMPORT_MODAL_STYLE = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  maxHeight: '80vh',
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
  overflow: 'auto',
  '&::-webkit-scrollbar': { display: 'none' },
};

export const CANCEL_BUTTON_STYLE = {
  color: BP_COLOR[20],
  backgroundColor: BP_COLOR['solid_grey'],
  '&:hover, &:active': {
    backgroundColor: BP_COLOR['40'],
    textDecoration: 'underline',
  },
};
