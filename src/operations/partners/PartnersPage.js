import { Card, CardContent, CardHeader } from '@mui/material';
import { PartnersContainer } from './PartnersCard';
import { CONTAINER } from './style';
import { partners } from './partners';
import { BPConstruction } from 'src/common/components/BPConstruction';

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
          <PartnersContainer partner={partner} key={`${partner.name}-${k}`} />
        ))}
      </CardContent>
    </Card>
  );
};
