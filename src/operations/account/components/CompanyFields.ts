export const businessActivitiesField = [
  {
    label: 'Activité principale',
    name: 'businessActivities.primary',
    'data-cy': 'primary-activity-select',
  },
  {
    label: 'Activité secondaire',
    name: 'businessActivities.secondary',
    'data-cy': 'secondary-activity-select',
  },
];

const flattenErrorPaths = (errors: any, prefix = ''): string[] =>
  Object.entries(errors || {}).flatMap(([key, value]: [string, any]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value?.message ? [path] : flattenErrorPaths(value, path);
  });

export const getInvalidFieldLabels = (errors: any): string[] => {
  const labelByName = [...getCompanyFields(undefined), ...businessActivitiesField].reduce(
    (acc, { name, label }) => ({ ...acc, [name]: label }),
    {} as Record<string, string>
  );
  return flattenErrorPaths(errors).map(path => labelByName[path] || path);
};

export const getCompanyFields = (record: any) => {
  return [
    {
      label: 'Adresse',
      value: record?.contactAddress?.address,
      name: 'contactAddress.address',
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
      isMoney: true,
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
      cutString: true,
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
