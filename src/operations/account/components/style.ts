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
    boxShadow: '0 2px 10px #4F6350',
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
    width: { xs: '200px', sm: '200px', lg: '200px' },
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
};
