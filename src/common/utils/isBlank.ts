const isBlankNumber = (str: string) => {
  if (!str || isNaN(+str)) {
    return true;
  }
  return false;
};

export default isBlankNumber;
