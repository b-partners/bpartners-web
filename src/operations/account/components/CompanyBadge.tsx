import { PALETTE_COLORS } from '@/common/config/theme';
import { Badge, BadgeProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: PALETTE_COLORS.pine,
    color: PALETTE_COLORS.pine,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    borderRadius: '100%',
    width: '20px',
    height: '20px',
    '&::after': {
      position: 'absolute',
      top: -1,
      left: -1,
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

export const CompanyBadge = (props: BadgeProps) => {
  return <StyledBadge {...props} />;
};
