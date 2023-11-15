import { v4 as uuid } from 'uuid';

export const ProspectEvaluateJobsMapper = (from: Date, to: Date, calendarId: string) => {
  const id = uuid();
  const requestBody = [
    {
      jobId: id,
      metadata: {},
      eventProspectConversion: {
        calendarId: calendarId,
        evaluationRules: {
          profession: 'ANTI_HARM',
          antiHarmRules: {
            interventionTypes: ['RAT_REMOVAL'],
            infestationType: 'souris',
          },
        },
        eventDateRanges: {
          from: from,
          to: to,
        },
        ratingProperties: {
          minCustomerRating: 8,
          minProspectRating: 8,
        },
      },
    },
  ];
  return requestBody;
};
