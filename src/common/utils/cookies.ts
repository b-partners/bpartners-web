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

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(cookieName) === 0) {
      return decodeURIComponent(cookie.substring(cookieName.length));
    }
  }
  return null;
};
