export const getImageSize = (src: string) =>
  new Promise<number>(resolve => {
    const newImg = new Image();
    newImg.src = src;
    newImg.onload = () => {
      resolve(newImg.width);
    };
  });
