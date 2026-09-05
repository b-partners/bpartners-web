import { PALETTE_COLORS } from '@/common/config/theme';
import { alpha, SxProps } from '@mui/material';

export const SirenModalStyle: SxProps = {
  minWidth: 420,
  paddingTop: 1,
  '& .siren-description': {
    marginBottom: 2,
    fontSize: '0.9rem',
  },
  '& .siren-input': {
    width: '100%',
  },
};

export const SlashIconStyle: SxProps = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transform: 'translateY(-4px)',
  '& .slash-line': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(45deg)',
    borderTop: '2px solid white',
    width: '100%',
    height: '4px',
    bgcolor: '#757575',
    pointerEvents: 'none',
  },
};

const ORANGE = PALETTE_COLORS.neon_orange;
const ORANGE_DARK = PALETTE_COLORS.neon_orange_dark;
const FOREST = PALETTE_COLORS.forest;
const TINT = PALETTE_COLORS.cream;
const BORDER = PALETTE_COLORS.linen;
const MUTED = PALETTE_COLORS.stone;
const TEXT = PALETTE_COLORS.black;
const WHITE = PALETTE_COLORS.white;

const SUBSCRIPTION_FLOW_HEIGHT = '452px';

const subscriptionDialogShell = {
  '& .subscription-step-title': {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 24px 10px',
  },
  '& .subscription-step-title-icon': {
    flexShrink: 0,
    width: '36px',
    height: '36px',
    borderRadius: '11px',
    bgcolor: PALETTE_COLORS.peach,
    color: ORANGE_DARK,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  '& .subscription-step-title-icon svg': { fontSize: '20px' },
  '& .subscription-step-title-text': { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  '& .subscription-step-title-main': { fontSize: '15px', fontWeight: 700, lineHeight: 1.25, color: FOREST },
  '& .subscription-step-title-hint': { fontSize: '11px', fontWeight: 500, lineHeight: 1.35, color: MUTED },
  '& .subscription-step-actions': { padding: '10px 24px 20px', gap: '10px' },
  '& .subscription-step-button': {
    minWidth: '136px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700,
    padding: '7px 20px',
    textTransform: 'none',
    boxShadow: 'none',
    border: '2px solid transparent',
    bgcolor: ORANGE,
    color: WHITE,
    '&:hover': { bgcolor: ORANGE_DARK, boxShadow: 'none' },
    '&.Mui-disabled': { bgcolor: alpha(ORANGE, 0.55), color: WHITE },
  },
  '& .subscription-step-button--ghost': {
    bgcolor: 'transparent',
    color: ORANGE,
    border: `2px solid ${ORANGE}`,
    '&:hover': { bgcolor: ORANGE, color: WHITE },
    '&.Mui-disabled': { bgcolor: 'transparent', borderColor: BORDER, color: MUTED },
  },
};

export const SubscriptionPlansDialogStyle: SxProps = {
  '& .MuiDialog-paper': { borderRadius: '16px', bgcolor: WHITE },
  ...subscriptionDialogShell,
};

export const SubscriptionFlowDialogStyle: SxProps = {
  '& .MuiDialog-paper': { borderRadius: '16px', bgcolor: WHITE, maxWidth: '560px', height: SUBSCRIPTION_FLOW_HEIGHT },
  ...subscriptionDialogShell,
};

export const SubscriptionConsentStyle: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  paddingTop: '4px',
  '& .consent-intro': { fontSize: '12.5px', lineHeight: 1.5, color: TEXT },
  '& .consent-intro strong': { color: ORANGE_DARK },
  '& .consent-timeline': {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 18px',
    borderRadius: '14px',
    border: `1px solid ${BORDER}`,
    bgcolor: TINT,
  },
  '& .consent-date': { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 },
  '& .consent-date--end': { alignItems: 'flex-end', textAlign: 'right' },
  '& .consent-date-label': {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: MUTED,
    whiteSpace: 'nowrap',
  },
  '& .consent-date-value': { fontSize: '16px', fontWeight: 800, lineHeight: 1.15, color: FOREST, whiteSpace: 'nowrap', textTransform: 'capitalize' },
  '& .consent-option': {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px 14px 12px',
    borderRadius: '14px',
    border: `1px solid ${BORDER}`,
    bgcolor: WHITE,
    transition: 'border-color 0.15s ease, background-color 0.15s ease',
  },
  '& .consent-option:hover': { borderColor: PALETTE_COLORS.sand },
  '& .consent-option--checked': { borderColor: ORANGE, bgcolor: alpha(ORANGE, 0.05) },
  '& .consent-option .MuiFormControlLabel-root': { margin: 0, width: '100%', alignItems: 'center', gap: '8px' },
  '& .consent-option .MuiFormControlLabel-label': { fontSize: '12.5px', fontWeight: 700, lineHeight: 1.35, color: TEXT },
  '& .consent-option .MuiCheckbox-root': { padding: '4px' },
  '& .consent-option-hint': { fontSize: '11px', lineHeight: 1.4, color: MUTED, paddingLeft: '34px' },
  '& .consent-cgu': { fontSize: '11px', lineHeight: 1.45, color: MUTED, marginTop: 'auto' },
  '& .consent-cgu a': { color: ORANGE, fontWeight: 700, textDecoration: 'none' },
  '& .consent-cgu a:hover': { textDecoration: 'underline' },
  '& .consent-confirm': {
    flex: '1 0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: '12px',
  },
  '& .consent-confirm-text': { fontSize: '12.5px', lineHeight: 1.55, color: TEXT, maxWidth: '400px' },
  '& .consent-confirm-text strong': { color: ORANGE_DARK },
  '& .consent-recap': {
    alignSelf: 'stretch',
    padding: '2px 16px',
    borderRadius: '14px',
    border: `1px solid ${BORDER}`,
    bgcolor: TINT,
  },
  '& .consent-recap-row': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '10px 0',
  },
  '& .consent-recap > * + *': { borderTop: `1px dashed ${PALETTE_COLORS.sand}` },
  '& .consent-recap-plan': { display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 0' },
  '& .consent-recap-plan-header': { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', textAlign: 'left' },
  '& .consent-recap-plan-name': {
    fontSize: '13px',
    fontWeight: 800,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    lineHeight: 1.2,
    color: FOREST,
  },
  '& .consent-recap-plan-price': { display: 'flex', alignItems: 'baseline', gap: '6px' },
  '& .consent-recap-plan-amount': { fontSize: '22px', fontWeight: 800, lineHeight: 1.15, color: ORANGE, whiteSpace: 'nowrap' },
  '& .consent-recap-plan-period': {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: MUTED,
    whiteSpace: 'nowrap',
  },
  '& .consent-recap-plan-vat': { fontSize: '11px', color: MUTED, lineHeight: 1.35 },
  '& .consent-recap-label': {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: MUTED,
    textAlign: 'left',
  },
  '& .consent-recap-value': { fontSize: '13px', fontWeight: 800, color: FOREST, whiteSpace: 'nowrap' },
  '& .consent-recap-value--period': { textTransform: 'capitalize' },
  '& .consent-recap-features': {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '4px 14px',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  '& .consent-recap-feature': {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
    fontSize: '11.5px',
    lineHeight: 1.35,
    color: TEXT,
    textAlign: 'left',
  },
  '& .consent-recap-feature svg': { fontSize: '14px', color: ORANGE, flexShrink: 0, marginTop: '1px' },
};

export const SubscriptionRedirectStyle: SxProps = {
  width: '100%',
  height: '100%',
  minHeight: '280px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  gap: '16px',
  '& .redirect-arrow': {
    width: 76,
    height: 76,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: alpha(ORANGE, 0.1),
    color: ORANGE,
  },
  '& .redirect-arrow svg': {
    fontSize: 40,
    animation: 'redirect-arrow-move 1.1s ease-in-out infinite',
  },
  '@keyframes redirect-arrow-move': {
    '0%': { transform: 'translateX(-8px)', opacity: 0.35 },
    '50%': { transform: 'translateX(8px)', opacity: 1 },
    '100%': { transform: 'translateX(-8px)', opacity: 0.35 },
  },
  '& .redirect-title': {
    fontWeight: 700,
    fontSize: '15px',
    lineHeight: 1.35,
    color: FOREST,
    maxWidth: '420px',
  },
  '& .redirect-subtitle': { fontSize: '12px', color: MUTED, maxWidth: '380px' },
  '& .redirect-progress': {
    width: '180px',
    height: '4px',
    borderRadius: '999px',
    bgcolor: TINT,
    '& .MuiLinearProgress-bar': { bgcolor: ORANGE },
  },
  '& .redirect-secure': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: 600,
    color: MUTED,
  },
  '& .redirect-secure svg': { fontSize: '14px', color: PALETTE_COLORS.pine },
};
