export const objectMapper = <T extends Record<string, any>>(obj: T, keys: (keyof T)[], mapper: (value: any) => any) => {
  const mappedObject = { ...obj };

  keys.forEach(key => {
    mappedObject[key] = mapper(obj[key]);
  });
  return mappedObject;
};
