export const getUrlParams = (search: string, key: string) => new URLSearchParams(search).get(key);
export const parseUrlParams = () => Object.fromEntries(new URLSearchParams(window.location.search)); // * example : const {key, key2} = parseUrlParams();
