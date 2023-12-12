export const transactionMapper = (values: any, id:string, status:string) => {
  const formValues = [
    {
        id: id,
        recipients: values.recipient,
        emailObject: values.subject,
        emailBody: values.message,
        attachments: values.attachments,
        status: status
      }
    ]


  return formValues;
};
