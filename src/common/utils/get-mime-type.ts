import { ChangeEvent } from 'react';

export const getMimeType = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files[0];
  return file.type;
};
