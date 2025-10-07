export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
};

export const base64ToFile = (base64: string, fileName: string): File => {
  const [meta, data] = base64.split(',');
  const mime = meta.match(/:(.*?);/)?.[1] || '';
  const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));
  return new File([bytes], fileName, { type: mime });
};
