const getParams = (search: string, key: string) => new URLSearchParams(search).get(key);

export default getParams;