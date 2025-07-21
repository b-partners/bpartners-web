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
    },
    {
      label: 'Ville',
      value: record?.contactAddress?.city,
    },
    {
      label: 'Pays',
      value: record?.contactAddress?.country,
    },
    {
      label: 'Adresse',
      value: record?.contactAddress?.address,
    },
    {
      label: 'Code commune de prospection',
      value: record?.companyInfo?.townCode,
    },
    {
      label: 'Activité officielle',
      value: record?.officialActivityName,
    },
    {
      label: 'Numéro de TVA',
      value: record?.companyInfo?.tvaNumber,
    },
    {
      label: 'Capital social',
      value: record?.companyInfo?.socialCapital ? record.companyInfo.socialCapital.toLocaleString() + ' €' : 'Non renseigné',
    },
    {
      label: 'Site web',
      value: record?.companyInfo?.website,
    },
    {
      label: 'SIREN',
      value: record?.siren,
    },
  ];
};
