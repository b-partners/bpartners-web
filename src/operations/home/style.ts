import { PALETTE_COLORS } from '@/common/config/theme';
import { SxProps } from '@mui/material';

export const HomeStyle: SxProps = {
  '& .title': {
    fontSize: '2rem',
    textAlign: 'center',
    color: PALETTE_COLORS.neon_orange,
    fontWeight: 'bold',
    bgcolor: PALETTE_COLORS.white,
  },
  '& .main-container': {
    p: 3,
    bgcolor: PALETTE_COLORS.white,
    minHeight: '100vh',
  },
  '& .image-container': {
    width: '100%',
    maxHeight: '420px',
    minHeight: '370px',
    overflow: 'hidden',
    borderRadius: 3,
    mb: 2,
    '& img': {
      width: '100%',
      height: '500px',
      objectFit: 'cover',
      display: 'block',
    },
  },
  '& .address-box': {
    display: 'flex',
    mb: 1.5,
  },
  '& .address-field': {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      '& fieldset': {
        borderColor: PALETTE_COLORS.black,
      },
      '&:hover fieldset': {
        borderColor: PALETTE_COLORS.neon_orange,
      },
      '&.Mui-focused fieldset': {
        borderColor: PALETTE_COLORS.neon_orange,
      },
    },
  },
  '& .btn-analyse': {
    fontSize: '1rem',
    color: PALETTE_COLORS.white,
    height: '40px',
    borderRadius: 3,
    ml: 1,
    textAlign: 'center',
    mt: -0.1,
  },
  '& .left-box': {
    flexDirection: 'column',
    borderRadius: 2,
    bgcolor: PALETTE_COLORS.white,
    minHeight: 100,
    '& .MuiGrid-root': {
      alignItems: 'start',
    },
  },
  '& .prospect-item': {
    maxWidth: 300,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
  },
  '& .prospect-text': {
    textAlign: 'left',
    width: '95%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  '& .prospect-name': {
    fontWeight: 'bold',
  },
  '& .prospect-address': {
    fontSize: '0.875rem', // correspond à variant='body2'
    cursor: 'copy',
    userSelect: 'none',
  },
  '& .block-box': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 2,
    borderRadius: 2,
    boxShadow: '0 2px 6px #949494ff',
  },
  '& .block-white': {
    backgroundColor: PALETTE_COLORS.white,
    color: PALETTE_COLORS.black,
  },
  '& .block-orange': {
    backgroundColor: PALETTE_COLORS.neon_orange,
    color: PALETTE_COLORS.white,
  },
  '& .block-pine': {
    backgroundColor: PALETTE_COLORS.pine,
    color: PALETTE_COLORS.white,
  },
  '& .block-forest': {
    backgroundColor: PALETTE_COLORS.forest,
    color: PALETTE_COLORS.white,
  },
  '& .divider-black': {
    backgroundColor: PALETTE_COLORS.black,
    margin: '0 12px',
  },
  '& .divider-white': {
    backgroundColor: PALETTE_COLORS.white,
    margin: '0 12px',
  },
  '& .block-title': {
    fontWeight: 'bold',
    fontSize: '1.5rem',
  },
};
