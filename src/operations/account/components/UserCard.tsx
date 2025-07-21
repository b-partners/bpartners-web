import { getAccountLogoUrl } from '@/providers';
import { Avatar, Box, Card, CardContent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useRecordContext } from 'react-admin';
import { CompanyBadge } from './CompanyBadge';

const InfoLine = ({ value }: { value?: string }) => (value ? <Typography className='typo-user'>{value}</Typography> : null);

export const UserCard = () => {
  const record = useRecordContext();
  const [logoUrl, setLogoUrl] = useState<string | undefined>();

  useEffect(() => {
    setLogoUrl(getAccountLogoUrl());
  }, []);

  if (!record) return null;

  const { user, postalCode, companyInfo } = record;

  return (
    <Card className='card card-user'>
      <CardContent>
        <Box className='user-header'>
          <CompanyBadge overlap='circular' anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant='dot'>
            <Avatar className='avatar' src={logoUrl || '/Account/Photo-birdia-demo.webp'} alt='Photo de profil' />
          </CompanyBadge>

          <Box className='container-typo-user'>
            <InfoLine value={user?.lastName} />
            <InfoLine value={postalCode} />
            <InfoLine value={companyInfo?.email} />
            <InfoLine value={user?.phone} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
