import { v4 as uuid } from 'uuid';

export const annotatorMapper = (values: any) => { // mettre ici le vrai type depuis notre client
    return Object.entries(values).map(([id, attributes]) => ({
        id: uuid(),
        attributes,
        geometry: ''
      }));
};
