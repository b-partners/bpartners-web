export const getUrlParams = (search: string, key: string) => new URLSearchParams(search).get(key);
