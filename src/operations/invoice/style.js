import { BP_COLOR } from 'src/bp-theme';

export const DEFAULT_TEXT_FIELD_WIDTH = 300;
export const DEFAULT_ITEMS_WIDTH = 294;

export const INVOICE_EDITION = {
  LAYOUT: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  FORM: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: DEFAULT_TEXT_FIELD_WIDTH,
    justifyContent: 'flex-start',
    marginBlock: 10,
    alignItems: 'center',
  },
  LONG_LIST: {
    maxHeight: 600,
    overflowY: 'scroll',
    overflowX: 'hidden',
    width: '100%',
    marginBottom: 5,
    marginTop: 2,
    paddingBlock: 2,
    '&::-webkit-scrollbar': {
      apparence: 'none',
      width: 3,
    },
    '&::-webkit-scrollbar-track': {
      boxShadow: `inset 0 0 6px rgba(0, 0, 0, 0.3)`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: BP_COLOR[10],
    },
  },
  ACCORDION_DETAILS: {
    position: 'relative',
    width: 302,
  },
  PR_ITEMS: {
    width: DEFAULT_ITEMS_WIDTH,
    marginBlock: 1,
  },
};

export const errorStyle = {
  border: '2px solid rgba(255, 0, 0, 0.6)',
  borderRadius: 1,
};
