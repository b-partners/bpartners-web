import { BP_COLOR } from '@/bp-theme';
import { SxProps } from '@mui/material';

export const RichToolbarButtonStyle: SxProps = { minWidth: '2rem', borderRadius: '0.5rem' };

export const RichToolBarStyle: SxProps = {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  p: 1,
  boxShadow: 'rgba(27, 31, 35, 0.04) 0 1px 0 0',
  marginBottom: 2,
  position: 'sticky',
  top: '0',
  bgcolor: 'white',
  zIndex: '10',
};

export const RichTextEditorStyleMap = {
  STRIKETHROUGH: {
    textDecoration: 'line-through',
  },
};

export const RichAttachementAccordionStyle: SxProps = {
  mt: 2,
  border: 'none',
  '&:before': { display: 'none' },
  '& .MuiAccordionSummary-root': {
    borderTop: 'none',
    borderBottom: `1px solid ${BP_COLOR['solid_grey']}`,
    p: 0,
    '&.MuiAccordionSummary-content': {
      my: 0,
    },
  },
  '& .MuiBadge-root': {
    marginInline: '1rem',
  },
  '& .MuiBadge-root svg': {
    color: BP_COLOR['10'],
  },
  '& .MuiList-root .MuiChip-root': {
    marginTop: '0.3rem',
    marginLeft: '0.3rem',
  },
  '& .MuiAccordionDetails-root': {
    paddingY: 0,
    minHeight: '10rem',
  },
};
