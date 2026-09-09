import { parseUrlParams } from '@/common/utils';
import { annotatorProvider } from '@/providers/annotator-provider';
import { AreaPictureAnnotation } from '@bpartners/typescript-client';
import { useEffect, useState } from 'react';

export const useInvoiceAnnotation = (areaPictureAnnotationParam?: AreaPictureAnnotation) => {
  const { pictureId } = parseUrlParams();
  const [annotation, setAnnotation] = useState<AreaPictureAnnotation>(null);

  useEffect(() => {
    if (!pictureId) return;
    if (areaPictureAnnotationParam) return setAnnotation(areaPictureAnnotationParam);

    annotatorProvider.getAnnotationsPicture(pictureId).then(areaPictureAnnotations => {
      if (areaPictureAnnotations.length > 0) setAnnotation(areaPictureAnnotations[0]);
    });
  }, [pictureId, areaPictureAnnotationParam]);

  return { annotation, isAnnotationEmpty: !annotation?.annotations?.length };
};
