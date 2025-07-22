export const getCompanyFields = (record: any) => {
  const latestTarget = record?.revenueTargets?.at(-1);

  return [
    {
      label: 'Raison sociale',
      value: record?.name,
      name: 'name',
    },
    {
      label: 'Encaissement annuel à réaliser',
      value: latestTarget?.amountAttempted ? latestTarget.amountAttempted.toLocaleString() + ' €' : 'Objectif non défini',
      name: 'revenueTargets.amountAttempted',
    },
    {
      label: 'Activité principale',
      value: record?.businessActivities?.primary,
      name: 'businessActivities.primary',
    },
    {
      label: 'Activité secondaire',
      value: record?.businessActivities?.secondary,
      name: 'businessActivities.secondary',
    },
    {
      label: 'Code postal',
      value: record?.contactAddress?.postalCode,
      name: 'contactAddress.postalCode',
    },
    {
      label: 'Ville',
      value: record?.contactAddress?.city,
      name: 'contactAddress.city',
    },
    {
      label: 'Pays',
      value: record?.contactAddress?.country,
      name: 'contactAddress.country',
    },
    {
      label: 'Adresse',
      value: record?.contactAddress?.address,
      name: 'contactAddress.address',
    },
    {
      label: 'Code commune de prospection',
      value: record?.companyInfo?.townCode,
      name: 'companyInfo.townCode',
    },
    {
      label: 'Activité officielle',
      value: record?.officialActivityName,
      name: 'officialActivityName',
    },
    {
      label: 'Numéro de TVA',
      value: record?.companyInfo?.tvaNumber,
      name: 'companyInfo.tvaNumber',
    },
    {
      label: 'Capital social',
      value: record?.companyInfo?.socialCapital ? record.companyInfo.socialCapital.toLocaleString() + ' €' : 'Non renseigné',
      name: 'companyInfo.socialCapital',
    },
    {
      label: 'Site web',
      value: record?.companyInfo?.website,
      name: 'companyInfo.website',
    },
    {
      label: 'SIREN',
      value: record?.siren,
      name: 'siren',
    },
  ];
};
