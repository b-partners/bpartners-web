import { useAnnotator3DStore } from '@/common/store';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { v4 } from 'uuid';

export const Annotator3DSaveImage = (): null => {
  const { gl, scene } = useThree();
  const { setImageUrl } = useAnnotator3DStore();

  useEffect(() => {
    if (scene.children.some(c => c.type !== 'Group' && c.type !== 'Scene')) {
      const dataUrl = gl.domElement.toDataURL('image/png');
      const [header, base64] = dataUrl.split(',');

      const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const file = new File([bytes], `${v4()}.png`, { type: mime });

      setImageUrl(file);
    }
  }, [scene]);

  return null;
};
