export const transformObjectField = <T extends Record<string, any>>(obj: T, keys: (keyof T)[], callbackFunction: (value: any) => any) => {
  const res = { ...obj };
  keys.forEach(key => {
    res[key] = callbackFunction(obj[key]);
  });
  return res as T;
};
