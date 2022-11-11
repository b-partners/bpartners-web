export const isIncludesObject = (array, key, value) => {
  for (let a of array) {
    if (a[key] === value) {
      return true;
    }
  }
  return false;
};
