import { PALETTE_COLORS } from '@/bp-theme';
import { SxProps } from '@mui/material';

const ACCENT = PALETTE_COLORS.neon_orange;
const MUTED = '#6b7280';
const PLACEHOLDER = '#9aa0a6';

export const CustomPageEditorStyle: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '86vh',
  bgcolor: PALETTE_COLORS.white,

  '& .editor-bar': {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexShrink: 0,
    px: 2,
    py: 1.5,
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  },
  '& .editor-back': {
    flexShrink: 0,
    color: MUTED,
  },
  '& .editor-heading': {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    fontWeight: 700,
    color: PALETTE_COLORS.forest,
  },
  '& .editor-bar .bar-btn': {
    minWidth: 104,
    textTransform: 'none',
    fontWeight: 600,
  },

  '& .editor-canvas': {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    bgcolor: '#f1f3f4',
    px: 2,
    py: 3,
  },
  '& .page-sheet': {
    maxWidth: 640,
    minHeight: 460,
    mx: 'auto',
    px: 6,
    py: 5,
    bgcolor: PALETTE_COLORS.white,
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(60, 64, 67, 0.3), 0 4px 8px 3px rgba(60, 64, 67, 0.15)',
  },

  '& .MuiInputBase-input::placeholder': {
    color: PLACEHOLDER,
    opacity: 1,
  },

  '& .page-title .MuiInputBase-input': {
    fontSize: 26,
    fontWeight: 700,
    lineHeight: 1.3,
    color: PALETTE_COLORS.forest,
  },
  '& .page-hint': {
    fontSize: 13,
    color: PLACEHOLDER,
    textAlign: 'center',
    py: 4,
  },

  '& .blocks': {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    mt: 2,
  },
  '& .block': {
    position: 'relative',
    px: 1,
    py: 0.75,
    mx: -1,
    borderRadius: '4px',
    border: '1px solid transparent',
    transition: 'border-color 0.15s ease',
    '&:hover': { borderColor: 'rgba(0, 0, 0, 0.08)' },
  },
  '& .block-toolbar': {
    position: 'absolute',
    top: 2,
    right: 2,
    opacity: 0,
    transition: 'opacity 0.15s ease',
  },
  '& .block:hover .block-toolbar, & .block:focus-within .block-toolbar': { opacity: 1 },
  '& .block-menu': {
    color: '#9ca3af',
    bgcolor: PALETTE_COLORS.white,
    '&:hover': { color: PALETTE_COLORS.black },
  },

  '& .block-text .MuiInputBase-input': {
    fontSize: 14,
    lineHeight: 1.65,
    color: PALETTE_COLORS.black,
  },
  '& .prio-important .block-text .MuiInputBase-input': {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 1.45,
  },
  '& .prio-small .block-text .MuiInputBase-input': {
    fontSize: 12,
    color: MUTED,
  },

  '& .block-image': {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
  },
  '& .image-drop': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 150,
    px: 2,
    borderRadius: '6px',
    border: '2px dashed rgba(0, 0, 0, 0.16)',
    bgcolor: 'rgba(0, 0, 0, 0.015)',
    transition: 'border-color 0.15s ease, background-color 0.15s ease',
    '&:hover': { borderColor: 'rgba(255, 82, 27, 0.5)', bgcolor: 'rgba(255, 82, 27, 0.04)' },
  },
  '& .prio-small .image-drop': { minHeight: 104 },
  '& .prio-important .image-drop': { minHeight: 200 },
  '& .image-drop-target': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0.5,
    width: '100%',
    height: '100%',
    minHeight: 'inherit',
    color: PLACEHOLDER,
    '& svg': { fontSize: 40 },
  },
  '& .image-drop-label': {
    fontSize: 12.5,
    fontWeight: 500,
  },
  '& .image-url .MuiInputBase-input': {
    fontSize: 13,
    textAlign: 'center',
  },
  '& .image-frame': {
    display: 'block',
    width: '100%',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  '& .image-preview': {
    display: 'block',
    width: '100%',
    maxHeight: 260,
    objectFit: 'cover',
  },
  '& .image-caption .MuiInputBase-input': {
    fontSize: 12,
    fontStyle: 'italic',
    color: MUTED,
    textAlign: 'center',
  },

  '& .table-sheet': {
    display: 'grid',
    border: '1px solid rgba(0, 0, 0, 0.14)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  '& .table-cell': {
    px: 1,
    py: 0.75,
    borderRight: '1px solid rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    '& .MuiInputBase-input': { fontSize: 12.5, lineHeight: 1.4 },
  },
  '& .table-head': {
    bgcolor: 'rgba(0, 0, 0, 0.04)',
    '& .MuiInputBase-input': { fontWeight: 700 },
  },
  '& .table-controls': {
    display: 'flex',
    gap: 1.5,
    mt: 0.75,
    opacity: 0,
    transition: 'opacity 0.15s ease',
  },
  '& .block:hover .table-controls, & .block:focus-within .table-controls': { opacity: 1 },
  '& .table-control': {
    fontSize: 12,
    fontWeight: 600,
    color: MUTED,
    px: 0.5,
    borderRadius: '4px',
    '&:hover': { color: ACCENT },
    '&.Mui-disabled': { opacity: 0.4 },
  },

  '& .block-columns': {
    display: 'grid',
    gap: 1.5,
  },
  '& .column': {
    position: 'relative',
    minWidth: 0,
    p: 1,
    borderRadius: '4px',
    bgcolor: 'rgba(0, 0, 0, 0.02)',
  },
  '& .column-toolbar': {
    position: 'absolute',
    top: 2,
    right: 2,
    opacity: 0,
    transition: 'opacity 0.15s ease',
  },
  '& .column:hover .column-toolbar, & .column:focus-within .column-toolbar': { opacity: 1 },

  '& .add-block': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.75,
    width: '100%',
    mt: 2,
    py: 1.25,
    borderRadius: '4px',
    border: '1px dashed rgba(0, 0, 0, 0.16)',
    color: MUTED,
    fontSize: 13,
    fontWeight: 600,
    transition: 'border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease',
    '&:hover': { borderColor: ACCENT, color: ACCENT, bgcolor: 'rgba(255, 82, 27, 0.04)' },
  },
};
