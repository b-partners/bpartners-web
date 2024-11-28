export const parseLocalStorage = <T>(key: string) => {
  const value = localStorage.getItem(key);
  try {
    return JSON.parse(value ?? '') as T;
  } catch {
    return undefined;
  }
};
