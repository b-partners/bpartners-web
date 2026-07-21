const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> =>
  new Promise(resolve => canvas.toBlob(blob => resolve(blob), type, quality));

interface CompressImageOptions {
  mimeType: string;
  quality?: number;
  outputType?: string;
}

export const compressImage = async (source: Blob | ArrayBuffer, { mimeType, quality = 0.92, outputType = 'image/webp' }: CompressImageOptions): Promise<Blob> => {
  const blob = source instanceof Blob ? source : new Blob([source], { type: mimeType });
  if (!mimeType.startsWith('image/')) return blob;

  const url = URL.createObjectURL(blob);
  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) return blob;
    context.drawImage(image, 0, 0);
    const compressed = await canvasToBlob(canvas, outputType, quality);
    return compressed && compressed.size < blob.size ? compressed : blob;
  } catch {
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
};
