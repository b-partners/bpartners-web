import { useThree } from '@react-three/fiber';
import { FC, useEffect } from 'react';

import { useAnnotator3DStore } from '@/common/store';

export const RaycasterHandler: FC<any> = ({ citymodel }) => {
  const { camera, gl, raycaster, scene } = useThree();
  const { selectObject, setSelectedObjectInfo } = useAnnotator3DStore();

  useEffect(() => {
    const unsubscribe = useAnnotator3DStore.subscribe(({ selectedObjectInfo, shouldSelectSurface }) => {
      scene.traverse((obj: any) => {
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const mat of mats) {
            if (mat.isCityObjectsMaterial) {
              obj.material.highlightColor = 0x00ff00;
              mat.selectSurface = shouldSelectSurface;
              mat.highlightedObject = selectedObjectInfo || {};
            }
          }
        }
      });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleClick = () => {
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length === 0) {
        selectObject(null);
        setSelectedObjectInfo(null);
        return;
      }

      const intersection: any = intersects[0];

      if (intersection?.object?.isCityObject) {
        const info = intersection.object.resolveIntersectionInfo(intersection, citymodel);
        selectObject(intersection);
        setSelectedObjectInfo(info);
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [camera, gl, raycaster]);

  return null;
};
