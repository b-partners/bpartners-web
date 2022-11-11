// TODO: switch to sessionStorage in case of private browsing
export const Cache = {
  get: (key: string) => {
    return localStorage.getItem(key);
  },

  set: (key: string, value: any) => {
    localStorage.setItem(key, value);
    if (key in localStorage) {
      return value;
    }
    throw new Error("the item couldn't be set");
  },

  clear: () => localStorage.clear(),
};
