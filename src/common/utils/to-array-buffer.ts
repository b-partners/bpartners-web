import { ChangeEvent } from 'react';

export const toArrayBuffer = (e: ChangeEvent<HTMLInputElement>): Promise<any> =>
  new Promise((resolve, reject) => {
    let file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = event => {
      resolve(event.target.result);
    };

    reader.onerror = () => reject(reader.error);

    reader.readAsArrayBuffer(file);
  });
