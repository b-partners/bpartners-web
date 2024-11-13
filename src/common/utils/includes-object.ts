export const includesObject = (array: Record<string, any>[], key: string, value: any) => {
  for (const a of array) {
    if (a[key] === value) {
      return true;
    }
  }
  return false;
};
