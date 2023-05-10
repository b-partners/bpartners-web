export const printError = (err: any) => {
  console.log(err);
};
export const handleSubmit = (callback: (event: any) => Promise<any>) => (event: any) => {
  callback(event).catch(printError);
};
