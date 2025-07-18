import { PALETTE_COLORS } from '@/common/config/theme';
import { getAccountLogoUrl } from '@/providers';
import { Avatar, Box, Card, CardContent, Typography } from '@mui/material';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { TextField, useRecordContext } from 'react-admin';

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

export const UserCard = () => {
  const { user, postalCode, companyInfo } = useRecordContext();
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    const url = getAccountLogoUrl();
    setLogoUrl(url);
  }, []);

  return (
    <Card className='card card-user'>
      <CardContent>
        <Box className='user-header'>
          <StyledBadge overlap='circular' anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant='dot'>
            <Avatar className='avatar' src={logoUrl || '/Account/Photo-birdia-demo.webp'} alt='Photo de profil' />
          </StyledBadge>
          <Box className='container-typo-user'>
            <Typography className='typo-user'>{user?.lastName}</Typography>
            <Typography className='typo-user'>{postalCode}</Typography>
            <Typography className='typo-user'>{companyInfo?.email}</Typography>
            <Typography className='typo-user'>{user?.phone}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
