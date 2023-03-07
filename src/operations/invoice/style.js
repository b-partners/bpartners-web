import { BP_COLOR } from 'src/bp-theme';

export const DEFAULT_TEXT_FIELD_WIDTH = 300;

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
  PRODUCT: {
    maxHeight: 600,
    overflowY: 'scroll',
    '&::-webkit-scrollbar': { width: 1 },
    '&::-webkit-scrollbar-thumb': { bgcolor: BP_COLOR[20] },
  },
  ACCORDION_DETAILS: {
    position: 'relative',
  },
};
