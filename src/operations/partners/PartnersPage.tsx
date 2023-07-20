import { Card, CardContent, CardHeader } from '@mui/material';
import { BPConstruction } from 'src/common/components/BPConstruction';
import { CONTAINER } from './style';
import { partners } from './partners';
import { PartnersCard } from './PartnersCard';

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
