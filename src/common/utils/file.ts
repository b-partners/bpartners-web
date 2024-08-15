type FileTransformer<T> = (reader: FileReader, file: File) => T;

export const filesToArrayBuffer = <T = unknown>(files: FileList, transform?: FileTransformer<T>) => {
  const allFiles = Array.from(files).map<Promise<T>>(file => {
    let reader = new FileReader();

    return new Promise(resolve => {
      reader.onload = () => {
        if (transform) {
          const result = transform(reader, file);
          resolve(result);
        }
        resolve(reader.result as T);
      };

      reader.readAsDataURL(file);
    });
  });

  return Promise.all(allFiles);
};

export const getFilenameMeta = (filename = '') => {
  const lastIndexOfDot = filename.lastIndexOf('.');

  if (lastIndexOfDot === -1) {
    return { name: filename, ext: '' };
  }
  const name = filename.substring(0, lastIndexOfDot);
  const ext = filename.substring(lastIndexOfDot + 1);

  return { name, ext };
};
