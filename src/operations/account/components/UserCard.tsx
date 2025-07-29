import { Box, Card, CardContent, Typography } from '@mui/material';
import { useRecordContext } from 'react-admin';
import { LogoShowLayout } from './LogoShowLayout';

const InfoLine = ({ value }: { value?: string }) => (value ? <Typography className='typo-user'>{value}</Typography> : null);

export const UserCard = () => {
  const record = useRecordContext();

  if (!record) return null;

  const { user, postalCode, companyInfo } = record;

  return (
    <Card className='card card-user'>
      <CardContent>
        <Box className='user-header' data-cy='input-logo'>
          <LogoShowLayout></LogoShowLayout>

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
