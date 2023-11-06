import { v4 as uuid } from 'uuid';

type DateRange = {
    from: Date;
    to: Date;
  };

export const ProspectEvaluateJobsMapper = ({from, to}: DateRange)=>{
    const id = uuid();
    const requestBody = [
      {
        jobId: id,
        metadata: {},
        eventProspectConversion: {
          calendarId: "e24ddd2d-9f26-47a6-a637-a5647b2f3320", // cet id doit être dynamique
          evaluationRules: {
            profession: 'ANTI_HARM',
            antiHarmRules: {
              interventionTypes: ['RAT_REMOVAL'],
              infestationType: 'souris',
            },
          },
          eventDateRanges: {
            from: from,
            to : to,
          },
          ratingProperties: {
            minCustomerRating: 8,
            minProspectRating: 8,
          },
        },
      },
    ];
    return requestBody;
}