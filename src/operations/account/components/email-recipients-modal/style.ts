import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

const ACCENT = PALETTE_COLORS.neon_orange;

export const EmailRecipientsModalStyle: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  width: 520,
  maxWidth: '100%',
  maxHeight: '88vh',
  p: 3,
  bgcolor: PALETTE_COLORS.white,

  '& .dialog-header': {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
  },
  '& .dialog-header-icon': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: '12px',
    color: ACCENT,
    bgcolor: 'rgba(255, 82, 27, 0.12)',
    '& svg': { fontSize: 24 },
  },
  '& .dialog-title': {
    fontSize: 18,
    fontWeight: 700,
    color: PALETTE_COLORS.forest,
    lineHeight: 1.25,
  },
  '& .dialog-subtitle': {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 1.35,
    mt: 0.25,
  },

  '& .dialog-state': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    color: '#6b7280',
  },

  '& .dialog-groups': {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5,
    mt: 2.5,
    overflowY: 'auto',
    pr: 0.5,
    mr: -0.5,
  },

  '& .recipient-row': {
    p: 1.5,
    borderRadius: '12px',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    transition: 'border-color 0.15s ease',
    '&:hover': { borderColor: 'rgba(255, 82, 27, 0.25)' },
  },
  '& .recipient-head': {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    mb: 1,
  },
  '& .recipient-icon': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: '8px',
    color: ACCENT,
    bgcolor: 'rgba(255, 82, 27, 0.12)',
    '& svg': { fontSize: 20 },
  },
  '& .recipient-text': {
    flex: 1,
    minWidth: 0,
  },
  '& .recipient-label': {
    fontSize: 14,
    fontWeight: 600,
    color: PALETTE_COLORS.black,
    lineHeight: 1.3,
  },
  '& .recipient-desc': {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 1.35,
    mt: 0.25,
  },

  '& .recipient-chips': {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    mb: 1,
  },
  '& .recipient-chip': {
    bgcolor: 'rgba(255, 82, 27, 0.08)',
    color: PALETTE_COLORS.forest,
    fontWeight: 500,
    '& .MuiChip-deleteIcon': {
      color: ACCENT,
      '&:hover': { color: PALETTE_COLORS.neon_orange },
    },
  },
  '& .recipient-empty': {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#9ca3af',
    mb: 1,
  },
  '& .recipient-input-row': {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1,
  },
  '& .recipient-input': {
    flex: 1,
    '& .MuiOutlinedInput-root': { borderRadius: '10px' },
  },
  '& .recipient-add-btn': {
    flexShrink: 0,
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: '10px',
    mt: 0.25,
  },

  '& .dialog-footer': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 1,
    mt: 3,
    pt: 2,
    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
  },
  '& .dialog-footer .footer-btn': {
    minWidth: 110,
    textTransform: 'none',
    fontWeight: 600,
  },
};
