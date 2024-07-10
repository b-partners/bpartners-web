export class Redirect {
  // note(test-redirect): window.location.replace does not work with cypress.
  // Hence we need to wrap it here so that we can mock it when testing, as per https://glebbahmutov.com/blog/stub-react-import
  // Cypress maintainer recommends another way, but it's too elaborate: https://www.youtube.com/watch?v=mML36U62-fQ
  public static toURL(newLocation: string) {
    return window.location.replace(newLocation);
  }
  public static toMail(email: string) {
    return this.toURL(`mailto:${email}`);
  }
  public static toPone(phone: string) {
    return this.toURL(`tel:${phone}`);
  }
}
