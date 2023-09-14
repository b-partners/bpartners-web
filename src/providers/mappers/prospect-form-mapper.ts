export const prospectFormMapper = (values: any) => {
  const formValues = [
    {
      jobId: values.jobId,
      metadata: values.metadata,
      spreadSheetEvaluation: {
        artisanOwner: values.artisanOwner,
        evaluationRules: {
          profession: values.profession,
          antiHarmRules: {
            interventionTypes: values.interventionTypes,
            infestationType: values.infestationType,
          },
          newInterventionOption: values.newInterventionOption,
        },
        sheetProperties: {
          spreadsheetName: values.spreedSheetName,
          sheetName: values.sheetName,
          ranges: {
            min: values.min,
            max: values.max,
          },
        },
        ratingProperties: {
          minCustomerRating: values.minCustomerRating,
          minProspectRating: values.minProspectRating,
        },
      },
    },
  ];

  return formValues;
};
