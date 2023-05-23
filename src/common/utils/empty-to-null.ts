/* TODO: use library instead */

/**
 * Transform all empty string in given object to null
 * @param obj
 * @returns mappedObject
 */
export const emptyToNull = <T extends Record<string, any>>(obj: T) => {
  let mappedObject = { ...obj };
  Object.keys(mappedObject).forEach((e: keyof T) => {
    if (!mappedObject[e] || (typeof mappedObject[e] === 'string' && mappedObject[e].length === 0)) {
      mappedObject[e] = null;
    } else if (typeof mappedObject[e] === 'object' && !mappedObject[e].length) {
      mappedObject[e] = emptyToNull(mappedObject[e]);
    }
  });
  return mappedObject;
};
