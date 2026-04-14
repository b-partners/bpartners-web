import _ from 'lodash';
export class ObjectUtilities {
  public static areObjectsEqual = (obj1: object, obj2: object): boolean => _.isEqual(obj1, obj2);
}
