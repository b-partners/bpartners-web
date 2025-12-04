import { v4 } from 'uuid';

export const jsonToFile = (data: any, filename?: string) => {
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json' });
  return new File([blob], filename || `${v4()}.json`, { type: 'application/json' });
};
