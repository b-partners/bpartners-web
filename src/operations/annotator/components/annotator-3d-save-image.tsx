import { useAnnotator3DStore } from '@/common/store';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { v4 } from 'uuid';

export const Annotator3DSaveImage = (): null => {
  const { gl } = useThree();
  const { setImageUrl, imageUrl } = useAnnotator3DStore();
  const imageBase64 = useRef<string>('');
  const intervalId = useRef<any>(null);
  const counter = useRef<number>(0);

  useEffect(() => {
    intervalId.current = setInterval(() => {
      const dataUrl = gl.domElement.toDataURL('image/png');

      if (imageBase64.current.length === 0) imageBase64.current = dataUrl;

      imageBase64.current = dataUrl;
      const [header, base64] = dataUrl.split(',');
      const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const file = new File([bytes], `${v4()}.png`, { type: mime });
      setImageUrl(file);
      counter.current++;

      if ((!imageUrl || imageUrl.size === 0) && counter.current >= 10) {
        clearInterval(intervalId.current);
      }
    }, 200);
  }, [imageUrl]);

  return null;
};
