import { PALETTE_COLORS } from '@/common/config/theme';
import { SxProps } from '@mui/material';

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
  '& .section-title-subscription': {
    backgroundColor: PALETTE_COLORS.pine,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 25,
    py: 1,
    mb: 3,
    mx: 'auto',
    fontSize: '1.3rem',
    width: '500px',
  },
  '& .price-subscription': {
    border: '1px solid #000000',
    borderRadius: 25,
    color: PALETTE_COLORS.neon_orange,
    py: 1,
    width: '17%',
    textAlign: 'center',
    ml: 3,
    mb: 3,
    fontSize: '1.1rem',
    fontWeight: 'bold',
  },
  '& .list-subscription': {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0,8rem',
    mr: 5,
  },
  '& .arrow-list': {
    color: PALETTE_COLORS.neon_orange,
    fontSize: '2.8rem',
    ml: 5,
  },
  '& .unsubscribe-text': {
    textAlign: 'end',
  },
};

export const SubscriptionInvoiceModalStyle: SxProps = {
  '& .MuiDialog-paper': {
    borderRadius: 3,
  },
  '& .subscription-invoice-title': {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    fontSize: '1.25rem',
    fontWeight: 700,
    color: PALETTE_COLORS.forest,
    pb: 1,
  },
  '& .subscription-invoice-title-icon': {
    color: PALETTE_COLORS.pine,
    fontSize: '1.75rem',
  },
  '& .subscription-invoice-period': {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    px: 2,
    py: 1.5,
    mb: 3,
    borderRadius: 2,
    bgcolor: PALETTE_COLORS.cream,
  },
  '& .subscription-invoice-period-label': {
    fontWeight: 600,
    color: PALETTE_COLORS.forest,
  },
  '& .subscription-invoice-year-select': {
    minWidth: 120,
    bgcolor: PALETTE_COLORS.white,
    borderRadius: 2,
    fontWeight: 600,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'transparent',
    },
    '&:hover .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: PALETTE_COLORS.pine,
      borderWidth: 1,
    },
  },
  '& .subscription-invoice-months': {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    gap: 1.5,
  },
  '& .subscription-invoice-month': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 2,
    py: 1.5,
    borderRadius: 2,
    border: '1px solid',
    borderColor: PALETTE_COLORS.linen,
    transition: 'border-color .2s ease, box-shadow .2s ease, transform .2s ease',
  },
  '& .subscription-invoice-month.is-available:hover': {
    borderColor: PALETTE_COLORS.pine,
    boxShadow: '0 6px 16px rgba(74, 100, 78, 0.16)',
    transform: 'translateY(-2px)',
  },
  '& .subscription-invoice-month.is-unavailable': {
    bgcolor: PALETTE_COLORS.cream,
    borderColor: 'transparent',
  },
  '& .subscription-invoice-month-name': {
    fontWeight: 600,
    color: PALETTE_COLORS.forest,
  },
  '& .is-unavailable .subscription-invoice-month-name': {
    fontWeight: 500,
    color: 'text.disabled',
  },
  '& .subscription-invoice-action': {
    minWidth: 130,
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 600,
    color: PALETTE_COLORS.pine,
    borderColor: PALETTE_COLORS.linen,
    '&:hover': {
      borderColor: PALETTE_COLORS.pine,
      bgcolor: 'rgba(74, 100, 78, 0.08)',
    },
    '&.Mui-disabled': {
      color: 'text.disabled',
      borderColor: 'transparent',
    },
  },
  '& .subscription-invoice-actions': {
    px: 3,
    pb: 2,
  },
  '& .subscription-invoice-close': {
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 600,
    color: PALETTE_COLORS.forest,
  },
};
