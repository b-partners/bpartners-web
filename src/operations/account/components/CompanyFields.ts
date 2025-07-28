export const businessActivitiesField = [
  {
    label: 'Activité principale',
    name: 'businessActivities.primary',
  },
  {
    label: 'Activité secondaire',
    name: 'businessActivities.secondary',
  },
];

export const getCompanyFields = (record: any) => {
  const latestTarget = record?.revenueTargets?.at(-1);

  return [
    {
      label: 'Adresse',
      value: record?.contactAddress?.address,
      name: 'contactAddress.address',
    },
    {
      label: 'Encaissement annuel à réaliser',
      value: latestTarget?.amountTarget ? latestTarget.amountTarget.toLocaleString() + ' €' : 'Objectif non défini',
      name: 'revenueTargets.' + (record?.revenueTargets?.length - 1) + '.amountTarget',
    },
    {
      label: 'Raison sociale',
      value: record?.name,
      name: 'name',
    },
    {
      label: 'Ville',
      value: record?.contactAddress?.city,
      name: 'contactAddress.city',
    },
    {
      label: 'Capital social',
      value: record?.companyInfo?.socialCapital ? record.companyInfo.socialCapital.toLocaleString() + ' €' : 'Non renseigné',
      name: 'companyInfo.socialCapital',
    },
    {
      label: 'Activité officielle',
      value: record?.officialActivityName,
      name: 'officialActivityName',
    },
    {
      label: 'Code postal',
      value: record?.contactAddress?.postalCode,
      name: 'contactAddress.postalCode',
    },
    {
      label: 'SIREN',
      value: record?.siren,
      name: 'siren',
    },
    {
      label: 'Numéro de TVA',
      value: record?.companyInfo?.tvaNumber,
      name: 'companyInfo.tvaNumber',
    },
    {
      label: 'Code postal commune de prospection',
      value: record?.companyInfo?.townCode,
      name: 'companyInfo.townCode',
    },
    {
      label: 'Trésorerie initial',
      value: record?.initialCashFlow,
      name: 'initialCashFlow',
    },
    {
      label: 'Site web',
      value: record?.companyInfo?.website,
      name: 'companyInfo.website',
    },
    {
      label: 'Pays',
      value: record?.contactAddress?.country,
      name: 'contactAddress.country',
    },
    {
      label: 'Lien du feedback',
      value: record?.feedback?.feedbackLink,
      name: 'feedback.feedbackLink',
    },
    {
      label: 'Téléphone',
      value: record?.companyInfo?.phone,
      name: 'companyInfo.phone',
      showOnEdit: true,
    },
    {
      label: 'Email',
      value: record?.companyInfo?.email,
      name: 'companyInfo.email',
      showOnEdit: true,
    },
  ];
};
