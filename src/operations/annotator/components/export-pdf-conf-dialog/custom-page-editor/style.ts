import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

const ACCENT = PALETTE_COLORS.neon_orange;

export const CustomPageEditorStyle: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  width: 560,
  maxWidth: '100%',
  maxHeight: '88vh',
  p: 3,
  bgcolor: PALETTE_COLORS.white,

  '& .editor-header': {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  '& .editor-back': {
    flexShrink: 0,
    color: '#6b7280',
  },
  '& .editor-title': {
    fontSize: 18,
    fontWeight: 700,
    color: PALETTE_COLORS.forest,
    lineHeight: 1.25,
  },
  '& .editor-subtitle': {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 1.35,
    mt: 0.25,
  },

  '& .editor-body': {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    mt: 2.5,
    overflowY: 'auto',
    pr: 0.5,
    mr: -0.5,
  },
  '& .editor-group-title': {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
    color: '#9ca3af',
    ml: 0.5,
    mb: 0.75,
  },
  '& .editor-empty': {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    py: 2,
    borderRadius: '10px',
    border: '1px dashed rgba(0, 0, 0, 0.12)',
  },

  '& .section-list': {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
  },
  '& .section-card': {
    p: 1.5,
    borderRadius: '10px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
  },
  '& .section-card-header': {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  '& .section-card-label': {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 700,
    color: PALETTE_COLORS.black,
  },
  '& .section-card-fields': {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
    mt: 1.5,
  },
  '& .section-panes': {
    display: 'flex',
    gap: 1.25,
    mt: 1.5,
  },
  '& .section-pane': {
    flex: 1,
    minWidth: 0,
    p: 1.25,
    borderRadius: '8px',
    bgcolor: 'rgba(0, 0, 0, 0.025)',
  },
  '& .section-pane-title': {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
    color: '#9ca3af',
    mb: 1,
  },
  '& .section-priority': {
    flexShrink: 0,
    width: 132,
  },
  '& .section-remove': {
    flexShrink: 0,
    color: '#9ca3af',
    '&:hover': { color: '#d32f2f' },
  },

  '& .table-grid': {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
  },
  '& .table-line': {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },
  '& .table-cell': {
    flex: 1,
    minWidth: 0,
  },
  '& .table-actions': {
    display: 'flex',
    gap: 1,
    mt: 0.5,
  },
  '& .table-action': {
    textTransform: 'none',
    fontSize: 12.5,
    fontWeight: 600,
  },

  '& .add-section': {
    alignSelf: 'flex-start',
    textTransform: 'none',
    fontWeight: 600,
    color: ACCENT,
    borderColor: 'rgba(255, 82, 27, 0.4)',
    '&:hover': { borderColor: ACCENT, bgcolor: 'rgba(255, 82, 27, 0.06)' },
  },

  '& .editor-footer': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 1,
    mt: 3,
    pt: 2,
    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
  },
  '& .editor-footer .footer-btn': {
    minWidth: 110,
    textTransform: 'none',
    fontWeight: 600,
  },
};
