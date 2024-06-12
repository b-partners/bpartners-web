const fileIdPattern = /files\/([^/]*)\/.*/;

export class PathVariable {
  public static getFileId(url: string) {
    const result = url.match(fileIdPattern);
    if (!result) {
      return '';
    }
    return result[1];
  }
}
