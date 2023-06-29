import { BP_COLOR } from '../../bp-theme';

export const DIALOG_CONTENT = {
  display: 'flex',
  justifyContent: 'center',
  position: 'relative',
  padding: 0,
  margin: 0,
  backgroundColor: BP_COLOR['solid_grey'],
};

export const VERTICAL_PAGINATION = {
  position: 'absolute',
  right: '2%',
  top: '50%',
  backgroundColor: 'rgb(255, 255, 255, 0.95)',
  margin: '0.2rem',
  translate: '0 -50%',
};

export const LEGAL_FILE_TITLE = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: 'max-content',
  padding: '0.3rem',
  borderRadius: '0.4rem 0 0 0.4rem',
  marginTop: '0.1rem',
  backgroundColor: '#fff',
  border: `1px solid`,
  borderTop: 'none',
  borderColor: BP_COLOR['solid_grey'],
};

export const UNVERIFIED_USER_BOX = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 1,
  p: 4,
};
