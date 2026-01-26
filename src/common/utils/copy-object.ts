export const copyObject = <T>(object: T) => JSON.parse(JSON.stringify(object)) as typeof object;
