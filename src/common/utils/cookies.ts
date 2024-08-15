/**
 * Set cookie by name
 * @param name
 * @param value
 * @param expiration in ms
 */
export const setCookie = (name: string, value: any, expiration: number) => {
  let cookie = name + '=' + encodeURIComponent(value);

  let expirationDate = new Date();
  expirationDate.setTime(expirationDate.getTime() + expiration);

  cookie += '; expires=' + expirationDate.toString();
  document.cookie = cookie;
};

export const getCookie = (name: string) => {
  let cookieName = name + '=';
  let cookies = document.cookie.split(';');

  for (let _cookie of cookies) {
    let cookie = `${_cookie}`;
    while (cookie.startsWith(' ')) {
      cookie = cookie.substring(1);
    }
    if (cookie.startsWith(cookieName)) {
      return decodeURIComponent(cookie.substring(cookieName.length));
    }
  }
  return null;
};
