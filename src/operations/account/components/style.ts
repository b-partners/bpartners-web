import { PALETTE_COLORS } from '@/common/config/theme';
import { alpha, SxProps } from '@mui/material';

export const AccountStyle: SxProps = {
  width: '100%',
  py: 4,
  bgcolor: '#ffffffff',
  '& #container': {
    maxWidth: '1400px',
    mx: 'auto',
    px: 2,
  },

  // --- UserCard ---
  '& .card': {
    borderRadius: 3,
    boxShadow: '0 2px 10px #4F635020',
    bgcolor: '#fff',
    p: 2,
    minHeight: '255px',
  },
  '& .card-user': {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  '& .user-header': {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 1,
  },
  '& .avatar': {
    width: 150,
    height: 150,
  },
  '& .container-typo-user': {
    ml: 7,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  '& .typo-user': {
    my: 1.2,
    fontWeight: 'bold',
  },

  // --- TrialCard ---
  '& .card-trial': {
    textAlign: 'center',
    bgcolor: '#ffffffff',
  },
  '& .section-title': {
    backgroundColor: PALETTE_COLORS.pine,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 25,
    py: 1,
    my: 1,
    mb: 3,
    mx: 'auto',
    fontSize: '1.3rem',
    width: '400px',
  },
  '& .trial-desciption': {
    fontStyle: 'italic',
    mb: 1.5,
  },
  '& .trial-start': {
    fontWeight: 'bold',
  },
  '& .trial-end': {
    mt: 2.5,
    fontWeight: 'bold',
  },
  '& .not-try': {
    my: 5.2,
    fontWeight: 'bold',
  },

  // --- CompanyCard ---
  '& .company-card': {
    mt: 3,
  },
  '& .company-header': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 4,
  },
  '& .section-title-company': {
    backgroundColor: PALETTE_COLORS.pine,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 25,
    py: 1,
    mb: 6,
    mx: 'auto',
    fontSize: '1.3rem',
    width: '500px',
  },
  '& .buton-edit': {
    position: 'relative',
    right: 0,
    transition: 'background-color 0.3s ease',
  },
  '& .buton-edit.active': {
    backgroundColor: PALETTE_COLORS.neon_orange,
    color: '#fff',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
  },
  '& .save-information-button': {
    backgroundColor: PALETTE_COLORS.neon_orange,
    color: 'white',
    textAlign: 'center',
    borderRadius: '12px',
    mx: 'auto',
    mt: 6,
    mb: -4,
  },

  // --- SubscriptionCard ---
  '& .subscription-card': {
    mt: 3,
  },
  '& .subscription-header': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    flexWrap: 'wrap',
    mb: 2.5,
  },
  '& .subscription-title': {
    fontSize: '20px',
    fontWeight: 700,
    color: PALETTE_COLORS.black,
  },
  '& .export-invoice-action': {
    backgroundColor: PALETTE_COLORS.neon_orange,
    color: PALETTE_COLORS.white,
    borderRadius: '999px',
    py: 0.9,
    px: 2.5,
    fontSize: '12px',
    fontWeight: 700,
    boxShadow: 'none',
    whiteSpace: 'nowrap',
    textTransform: 'none',
    flexShrink: 0,
    '&:hover': { backgroundColor: PALETTE_COLORS.neon_orange_dark, boxShadow: 'none' },
  },
  '& .subscription-plan': {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    mb: 1.5,
  },
  '& .subscription-plan-icon': {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    bgcolor: PALETTE_COLORS.peach,
    color: PALETTE_COLORS.neon_orange_dark,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    '& svg': { fontSize: '22px' },
  },
  '& .subscription-plan-name': {
    fontSize: '18px',
    fontWeight: 700,
    color: PALETTE_COLORS.black,
  },
  '& .subscription-plan-subtitle': {
    fontSize: '12px',
    lineHeight: 1.4,
    color: PALETTE_COLORS.stone,
  },
  '& .subscription-validating': {
    my: 5.2,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  '& .subscription-validating-text': {
    fontWeight: 'bold',
    color: PALETTE_COLORS.stone,
  },
  '& .subscription-empty': {
    my: 5.2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
  },
  '& .subscription-empty-text': {
    fontWeight: 'bold',
    color: PALETTE_COLORS.stone,
  },
  '& .subscription-price-row': {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    flexWrap: 'wrap',
  },
  '& .subscription-price': {
    fontSize: '30px',
    fontWeight: 800,
    color: PALETTE_COLORS.neon_orange,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  '& .subscription-price-suffix': {
    fontSize: '13px',
    fontWeight: 500,
    color: PALETTE_COLORS.stone,
  },
  '& .subscription-price-ht': {
    fontSize: '11px',
    color: PALETTE_COLORS.stone,
    mt: 0.5,
  },
  '& .subscription-price-yearly': {
    fontSize: '12px',
    color: PALETTE_COLORS.stone,
    mt: 0.25,
  },
  '& .subscription-features': {
    listStyle: 'none',
    m: 0,
    mt: 2,
    p: 0,
    borderTop: `1px dashed ${PALETTE_COLORS.sand}`,
  },
  '& .subscription-feature': {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    fontSize: '13px',
    lineHeight: 1.45,
    color: PALETTE_COLORS.black,
    py: 1,
    borderBottom: `1px dashed ${PALETTE_COLORS.sand}`,
  },
  '& .subscription-feature:last-of-type': { borderBottom: 'none' },
  '& .subscription-feature--strong': { fontWeight: 700 },
  '& .subscription-feature-check': {
    flexShrink: 0,
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    bgcolor: PALETTE_COLORS.peach,
    color: PALETTE_COLORS.neon_orange_dark,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mt: '2px',
    '& svg': { fontSize: '12px' },
  },
};

const PLAN_ORANGE = PALETTE_COLORS.neon_orange;
const PLAN_ORANGE_DARK = PALETTE_COLORS.neon_orange_dark;
const PLAN_ORANGE_SOFT = PALETTE_COLORS.peach;
const PLAN_ORANGE_TINT = PALETTE_COLORS.cream;
const PLAN_TEXT = PALETTE_COLORS.black;
const PLAN_WHITE = PALETTE_COLORS.white;
const PLAN_BORDER = PALETTE_COLORS.linen;
const PLAN_TEXT_MUTED = PALETTE_COLORS.stone;
const PLAN_BORDER_DOTTED = PALETTE_COLORS.sand;

export const SubscriptionPlansStyle: SxProps = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
  gap: '12px',
  alignItems: 'stretch',
  width: '100%',
  paddingTop: '8px',

  '& .plans-billing': {
    gridColumn: '1 / -1',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  '& .plans-billing-group': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    bgcolor: PLAN_WHITE,
    border: `1px solid ${PLAN_BORDER}`,
    borderRadius: '999px',
    padding: '3px',
    boxShadow: '0 4px 14px rgba(43, 25, 8, 0.06)',
  },
  '& .plans-billing-option': {
    border: 'none',
    borderRadius: '999px !important',
    textTransform: 'none',
    fontSize: '11px',
    fontWeight: 600,
    lineHeight: 1.4,
    color: PLAN_TEXT_MUTED,
    padding: '4px 14px',
    transition: 'all 0.2s',
    '&:hover': { bgcolor: PLAN_ORANGE_TINT },
    '&.Mui-selected': {
      bgcolor: PLAN_ORANGE,
      color: PLAN_WHITE,
      boxShadow: `0 2px 8px ${alpha(PLAN_ORANGE, 0.32)}`,
      '&:hover': { bgcolor: PLAN_ORANGE_DARK },
    },
  },
  '& .plans-billing-badge': {
    bgcolor: PLAN_ORANGE_TINT,
    color: PLAN_ORANGE_DARK,
    fontSize: '9px',
    fontWeight: 700,
    lineHeight: 1.7,
    padding: '0 6px',
    borderRadius: '999px',
    marginLeft: '5px',
  },

  '& .plans-state': {
    gridColumn: '1 / -1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    color: PLAN_TEXT_MUTED,
  },

  '& .plan-card': {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    bgcolor: PLAN_WHITE,
    border: `1px solid ${PLAN_BORDER}`,
    borderRadius: '14px',
    padding: '16px 14px 14px',
    boxShadow: '0 4px 14px rgba(43, 25, 8, 0.06)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  '& .plan-card:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 32px rgba(43, 25, 8, 0.09)',
  },
  '& .plan-card--featured': {
    border: `2px solid ${PLAN_ORANGE}`,
    bgcolor: PLAN_ORANGE_TINT,
  },

  '& .plan-badge': {
    position: 'absolute',
    top: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    bgcolor: PLAN_ORANGE,
    color: PLAN_WHITE,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    padding: '4px 12px',
    borderRadius: '999px',
    whiteSpace: 'nowrap',
  },

  '& .plan-icon': {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    bgcolor: PLAN_ORANGE_SOFT,
    color: PLAN_ORANGE_DARK,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  '& .plan-icon svg': { fontSize: '18px' },

  '& .plan-name': {
    fontSize: '16px',
    fontWeight: 700,
    color: PLAN_TEXT,
    marginBottom: '2px',
  },
  '& .plan-subtitle': {
    fontSize: '11px',
    lineHeight: 1.35,
    color: PLAN_TEXT_MUTED,
    marginBottom: '10px',
    minHeight: '30px',
  },

  '& .plan-price-row': {
    display: 'flex',
    alignItems: 'baseline',
    gap: '5px',
    flexWrap: 'wrap',
    marginBottom: '1px',
  },
  '& .plan-price': {
    fontSize: '26px',
    fontWeight: 800,
    color: PLAN_ORANGE,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  '& .plan-price-suffix': {
    fontSize: '12px',
    fontWeight: 500,
    color: PLAN_TEXT_MUTED,
  },
  '& .plan-price-ht': {
    fontSize: '10px',
    color: PLAN_TEXT_MUTED,
    margin: '3px 0 6px',
  },
  '& .plan-price-yearly': {
    fontSize: '11px',
    color: PLAN_TEXT_MUTED,
    marginBottom: '10px',
    minHeight: '15px',
  },
  '& .plan-price-yearly strong': { color: PLAN_TEXT },

  '& .plan-cta': {
    width: '100%',
    textTransform: 'none',
    padding: '7px 14px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700,
    lineHeight: 1.25,
    marginBottom: '12px',
    boxShadow: 'none',
    bgcolor: PLAN_ORANGE,
    color: PLAN_WHITE,
    '&:hover': { bgcolor: PLAN_ORANGE_DARK, boxShadow: 'none' },
  },
  '& .plan-cta--outline': {
    bgcolor: 'transparent',
    color: PLAN_ORANGE,
    border: `2px solid ${PLAN_ORANGE}`,
    '&:hover': { bgcolor: PLAN_ORANGE, color: PLAN_WHITE },
  },

  '& .plan-features': {
    listStyle: 'none',
    margin: 0,
    padding: '2px 0 0',
    borderTop: `1px dashed ${PLAN_BORDER_DOTTED}`,
  },
  '& .plan-feature': {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    fontSize: '11px',
    lineHeight: 1.35,
    color: PLAN_TEXT,
    padding: '6px 0',
    borderBottom: `1px dashed ${PLAN_BORDER_DOTTED}`,
  },
  '& .plan-feature:last-of-type': { borderBottom: 'none' },
  '& .plan-feature--strong': { fontWeight: 700 },
  '& .plan-feature-check': {
    flexShrink: 0,
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    bgcolor: PLAN_ORANGE_SOFT,
    color: PLAN_ORANGE_DARK,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '1px',
  },
  '& .plan-feature-check svg': { fontSize: '11px' },
};
