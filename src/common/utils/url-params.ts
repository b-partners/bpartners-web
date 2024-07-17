export class UrlParams {
  private static getUrl() {
    return new URL(window.location.href);
  }

  public static get(name: string) {
    return this.getUrl().searchParams.get(name);
  }

  public static set(name: string, value: string) {
    const url = this.getUrl();
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
  }
  public static clear() {
    const url = window.location.pathname;
    window.history.replaceState({}, '', url);
  }
}
