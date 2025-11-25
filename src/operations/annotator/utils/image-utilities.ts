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
