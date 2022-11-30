/* TODO: use library instead */
/**
 * Transform all empty string in given object to null
 * @param obj
 * @returns mappedObject
 */
const emptyToNull = (obj: any): any => {
  let mappedObject = { ...obj };
  Object.keys(mappedObject).forEach(e => {
    if (!mappedObject[e] || (typeof mappedObject[e] === 'string' && mappedObject[e].length === 0)) {
      mappedObject[e] = null;
    } else if (typeof mappedObject[e] === 'object' && !mappedObject[e].length) {
      mappedObject[e] = emptyToNull(mappedObject[e]);
    }
  });
  return mappedObject;
};

export default emptyToNull;
