import { Card, CardContent, CardHeader } from '@mui/material';
import { BPConstruction } from '@/common/components/BPConstruction';
import { partners } from './partners';
import { PartnersCard } from './PartnersCard';
import { CONTAINER } from './style';

export const PartnersPage = () => {
  return (
    <Card
      sx={{
        border: 'none',
        outline: 'none',
      }}
    >
      <CardHeader title='Nos Partenaires' />
      <BPConstruction />
      <CardContent sx={CONTAINER}>
        {partners.map((partner, k) => (
          <PartnersCard partner={partner} key={`partners-card-${k}`} />
        ))}
      </CardContent>
    </Card>
  );
};
