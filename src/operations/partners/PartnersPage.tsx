import { BPConstruction } from '@/common/components';
import { Card, CardContent, CardHeader } from '@mui/material';
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
      <BPConstruction
        sx={{
          position: 'absolute',
          bottom: 20,
          right: 5,
        }}
      />
      <CardContent sx={CONTAINER}>
        {partners.map((partner, k) => (
          <PartnersCard partner={partner} key={`partners-card-${k + partner.buttonLabel}`} />
        ))}
      </CardContent>
    </Card>
  );
};
