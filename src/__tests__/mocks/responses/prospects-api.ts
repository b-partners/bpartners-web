import { Prospect, ProspectStatus } from '@bpartners/typescript-client';

export const prospects: Prospect[] = [
  {
    id: 'prospect1_id',
    name: 'john doe',
    phone: '+261340465338 /',
    email: 'johnDoe@gmail.com',
    status: ProspectStatus.TO_CONTACT,
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
    email: 'micheleKlaffs@gmail.com',
    status: ProspectStatus.CONVERTED,
    address: '30 Rue de la Montagne Sainte-Genevieve',
    townCode: 12345,
    comment: 'Commentaire: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 'prospect7_id',
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

export const contactedProspect = {
  ...prospects[0],
  status: 'CONTACTED',
  prospectFeedback: 'INTERESTED',
  comment: 'Commentaire: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  contractAmount: '',
};

export const convertedProspect = {
  ...prospects[1],
  status: 'CONVERTED',
  prospectFeedback: 'INVOICE_SENT',
  comment: 'Commentaire: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  contractAmount: '321',
};

export const createdProspect = {
  email: 'doejhonson@gmail.com',
  phone: '+261340465399',
  address: 'Evry',
  name: 'Doe Jhonson',
  status: 'TO_CONTACT',
  defaultComment: 'create comment',
  invoiceID: 'invoice-DRAFT-1-id',
  contractAmount: '91',
};
