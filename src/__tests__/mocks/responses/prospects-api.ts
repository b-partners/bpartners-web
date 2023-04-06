import { Prospect } from 'bpartners-react-client';

export const prospects: Prospect[] = [
  {
    id: 'prospect1_id',
    name: 'john doe',
    phone: '+261340465338',
    email: 'johnDoe@gmail.com',
    status: 'TO_CONTACT',
    address: '30 Rue de la Montagne Sainte-Genevieve',
    townCode: 21547,
    location: {
      type: 'Point',
      longitude: 2.347,
      latitude: 48.8588,
    },
  },
  {
    id: 'prospect2_id',
    name: 'jane doe',
    phone: '+261340465339',
    email: 'janeDoe@gmail.com',
    status: 'CONTACTED',
    address: '30 Rue de la Montagne Sainte-Genevieve',
    townCode: 21547,
  },
  {
    id: 'prospect3_id',
    name: 'markus adams',
    phone: '+261340465340',
    email: 'markusAdams@gmail.com',
    status: 'TO_CONTACT',
    address: '30 Rue de la Montagne Sainte-Genevieve',
    townCode: 21547,
  },
  {
    id: 'prospect4_id',
    name: 'Alyssa Hain',
    phone: '+261340465341',
    email: 'alyssaHain@gmail.com',
    status: 'CONTACTED',
    address: '30 Rue de la Montagne Sainte-Genevieve',
    townCode: null,
  },
  {
    id: 'prospect5_id',
    name: 'Michele Klaffs',
    phone: '+261340465342',
    email: 'micheleKlaffs@gmail.com',
    status: 'CONTACTED',
    address: '30 Rue de la Montagne Sainte-Genevieve',
    townCode: 12345,
    location: {
      type: 'Point',
      longitude: 2.347,
      latitude: 48.8588,
    },
  },
  {
    id: 'prospect6_id',
    name: 'Michele Klaffs',
    phone: '+261340465342',
    email: 'micheleKlaffs@gmail.com',
    status: 'CONVERTED',
    address: '30 Rue de la Montagne Sainte-Genevieve',
    townCode: 12345,
  },
  {
    id: 'prospect7_id',
    name: 'Killy Waddilove',
    phone: '+261340465344',
    email: 'killyWaddilove@gmail.com',
    status: 'CONVERTED',
    address: '30 Rue de la Montagne Sainte-Genevieve',
    location: {
      type: 'Point',
      longitude: 2.347,
      latitude: 48.8588,
    },
  },
  {
    id: 'prospect8_id',
    name: null,
    phone: null,
    email: null,
    status: 'TO_CONTACT',
    address: '30 Rue de la Montagne Sainte-Genevieve',
    townCode: null,
    location: {
      type: 'Point',
      longitude: 2.347,
      latitude: 48.8588,
    },
  },
];
