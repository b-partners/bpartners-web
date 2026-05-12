import _ from 'lodash';
export class ObjectUtilities {
  public static areObjectsEqual = (obj1: object, obj2: object): boolean => _.isEqual(obj1, obj2);
  public static reorder = (obj: Record<string, any>, keys: (keyof typeof obj)[]) => {
    const newObject = {} as typeof obj;

    keys.forEach(key => {
      newObject[key] = obj[key];
    });

    return newObject;
  };
}
