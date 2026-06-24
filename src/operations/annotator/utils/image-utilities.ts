/**
 * Redraws an image translated by (xShift, yShift) onto a same-sized canvas, filling the
 * uncovered area with blank (transparent) pixels and cropping whatever overflows.
 * Used to align the CityJSON texture with the area picture when a shiftNb is applied.
 */
export const shiftImageWithBlankOffset = (imageSrc: string, xShift: number, yShift: number): Promise<string> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Unable to get 2d context'));

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, xShift, yShift);

      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = reject;
    image.src = imageSrc;
  });

export const createBlankImage = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');

  canvas.width = 520;
  canvas.height = 520;

  const width = canvas.width;
  const height = canvas.height;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const url = canvas.toDataURL('image/png');
  return url;
};
