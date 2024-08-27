export const includesObject = (array: Record<string, any>[], key: string, value: any) => {
  for (let a of array) {
    if (a[key] === value) {
      return true;
    }
  }
  return false;
};
