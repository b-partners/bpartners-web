import { Prospect, ProspectStatus } from '@bpartners/typescript-client';

export const prospects: Prospect[] = [
  {
    id: 'prospect1_id',
    name: 'john doe',
    phone: '+261340465338 /',
    email: 'johnDoe@gmail.com',
    status: ProspectStatus.TO_CONTACT,
    firstName: '',
    address: '30 Rue de la Montagne Sainte-Genevieve',
    townCode: 21547,
    comment: 'Commentaire: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    location: {
      type: 'Point',
      longitude: 2.347,
      latitude: 48.8588,
    },
    rating: {
      lastEvaluation: new Date('2023-10-10'),
      value: 9.99999999,
    },
  },
  {
    id: 'prospect2_id',
    name: 'jane doe',
    firstName: '',
    phone: '+261340465339',
    email: 'janeDoe@gmail.com',
    status: ProspectStatus.CONTACTED,
    address: '30 Rue de la Montagne Sainte-Genevieve',
    townCode: 21547,
    comment: 'Commentaire: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    rating: {
      lastEvaluation: new Date('2023-05-10'),
      value: 5.9978,
    },
  },
  {
    id: 'prospect3_id',
    firstName: '',
    name: 'markus adams',
    phone: '+261340465340',
    email: 'markusAdams@gmail.com',
    status: ProspectStatus.TO_CONTACT,
    address: '30 Rue de la Montagne Sainte-Genevieve',
    townCode: 21547,
    comment: 'Commentaire: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 'prospect4_id',
    name: 'Alyssa Hain',
    firstName: '',
    phone: '+261340465341',
    email: 'alyssaHain@gmail.com',
    status: ProspectStatus.CONTACTED,
    address: '30 Rue de la Montagne Sainte-Genevieve',
    townCode: null,
    comment: 'Commentaire: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 'prospect5_id',
    name: 'Michele Klaffs',
    firstName: '',
    phone: '+261340465342',
    email: 'micheleKlaffs@gmail.com',
    status: ProspectStatus.CONTACTED,
    address: '30 Rue de la Montagne Sainte-Genevieve',
    townCode: 12345,
    comment: 'Commentaire: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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
    firstName: '',
    email: 'micheleKlaffs@gmail.com',
    status: ProspectStatus.CONVERTED,
    address: '30 Rue de la Montagne Sainte-Genevieve',
    townCode: 12345,
    comment: 'Commentaire: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 'prospect7_id',
    firstName: '',
    name: 'Killy Waddilove',
    phone: '+261340465344',
    email: 'killyWaddilove@gmail.com',
    status: ProspectStatus.CONVERTED,
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
    firstName: '',
    phone: null,
    email: null,
    status: ProspectStatus.TO_CONTACT,
    address: '30 Rue de la Montagne Sainte-Genevieve',
    townCode: null,
    comment: 'Commentaire: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    location: {
      type: 'Point',
      longitude: 2.347,
      latitude: 48.8588,
    },
  },
];

export const updatedProspects: Prospect[] = [
  {
    id: 'prospect1_id',
    name: 'Doe Jhonson',
    phone: '+261340465399',
    firstName: '',
    email: 'doejhonson@gmail.com',
    status: ProspectStatus.TO_CONTACT,
    address: '30 Rue de la Montagne Sainte-Genevieve',
    townCode: 21547,
    comment: 'Update comment',
    location: {
      type: 'Point',
      longitude: 2.347,
      latitude: 48.8588,
    },
    rating: {
      lastEvaluation: new Date('2023-10-10'),
      value: 9.99999999,
    },
  },
  ...prospects,
];

export const createdProspect = {
  email: 'doejhonson@gmail.com',
  phone: '+261340465399',
  address: 'Paris',
  firstName: 'Doe',
  name: 'Johnson',
  status: 'TO_CONTACT',
  defaultComment: 'create comment',
};

export const createProspect = (number: number, status?: ProspectStatus) => {
  const prospects: Prospect[] = [];

  for (let a = 0; a < number; a++) {
    const prospect: Prospect = {
      id: `prospect-${status}-${a}`,
      name: 'John Doe',
      firstName: 'John Doe',
      phone: '+261340465338',
      email: 'johnDoe@gmail.com',
      status: status || ProspectStatus.TO_CONTACT,
      address: '30 Rue de la Montagne Sainte-Genevieve',
      townCode: 21547,
      rating: { value: a % 2 === 0 ? 10 : 6, lastEvaluation: new Date('2024-07-07') },
      comment: 'Commentaire: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      location: {
        type: 'Point',
        longitude: 2.347,
        latitude: 48.8588,
      },
    };
    prospects.push(prospect);
  }
  return prospects;
};

export const getProspect = (_page: number, pageSize: number, status: ProspectStatus) => {
  return createProspect(pageSize, status);
};

export const contactedProspect = {
  ...getProspect(1, 2, ProspectStatus.CONTACTED)[1],
  id: 'prospect-TO_CONTACT-1',
  prospectFeedback: 'INTERESTED',
  contractAmount: '',
};

export const convertedProspect = {
  ...getProspect(1, 2, ProspectStatus.CONVERTED)[1],
  id: 'prospect-CONTACTED-1',
  prospectFeedback: 'INVOICE_SENT',
  comment: 'Commentaire: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  contractAmount: '321',
};

export const prospectOne = prospects[0];
